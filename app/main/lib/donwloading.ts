import { ProgressBarState } from "@app/renderer/shared/progress";
import {
  BrowserWindow,
  BrowserWindowConstructorOptions,
  dialog,
} from "electron";
import { powerSaveBlocker } from "electron";

export class PowerStarter {
  private id: number | null = null;
  start() {
    if (this.id == null)
      this.id = powerSaveBlocker.start("prevent-app-suspension");
  }
  stop() {
    if (this.id != null) powerSaveBlocker.stop(this.id);
  }
}
export class DownloadingWindow extends BrowserWindow {
  constructor(...options: ConstructorParameters<typeof BrowserWindow>) {
    super(...options);
    this.setAppDetails({ appId: "Download" });
  }
}
export class DownloaderWindow extends DownloadingWindow {
  private startTime = Date.now();
  public static Windows: Record<string, DownloaderWindow> = {};
  private sleepId = new PowerStarter();
  private speedTransfer = 0;

  resumable?: boolean;
  fileSize?: number;
  curSize: number = 0;

  state: ProgressBarState["status"] = "connecting";

  private static addWindow(window: DownloaderWindow) {
    this.Windows[window.id] = window;
  }

  private static removeWindow(window: DownloaderWindow) {
    delete this.Windows[window.id];
  }
  public static fromWebContents(
    webContents: Electron.WebContents
  ): DownloaderWindow | null {
    const win = BrowserWindow.fromWebContents(webContents);
    if (!win) return null;
    return DownloaderWindow.Windows[win.id] || null;
  }
  constructor(options: BrowserWindowConstructorOptions) {
    super(options);
    this.on("close", () => {
      DownloaderWindow.removeWindow(this);
      this.sleepId.stop();
    });
    DownloaderWindow.addWindow(this);
  }

  changeState(state: ProgressBarState["status"]) {
    if (this.isDestroyed()) return;
    if (state != this.state) this.onChangeState(state);
    this.state = state;
  }
  onGetChunk(size: number) {
    this.sleepId.start();
    this.speedTransfer += size;
    this.setCurSize(this.curSize + size);
    const speed = Math.round(
      this.speedTransfer / Math.ceil((Date.now() - this.startTime) / 1000)
    );
    this.onSpeed(speed);
    if (this.state != "pause") this.changeState("receiving");
  }
  end() {
    this.changeState("completed");
    this.onCurSize(this.curSize);
    this.sleepId.stop();
    this.setProgressBar(-1);
    this.onEnd();
  }
  setCurSize(curSize: number) {
    this.curSize = curSize;
    this.onCurSize(curSize);
  }
  setResumability(state: boolean) {
    this.resumable = state;
    this.onResumability(state);
  }
  setFileSize(size?: number) {
    this.fileSize = size;
    this.onFileSize(size);
  }
  resetSpeed() {
    this.speedTransfer = 0;
    this.startTime = Date.now();
  }
  trigger(state: boolean) {
    if (state) {
      this.changeState("connecting");
      this.sleepId.start();
    } else {
      this.sleepId.stop();
      this.changeState("pause");
    }
  }
  error(err: any) {
    dialog.showErrorBox("Error Happened", err.toString());
    if (!this.isDestroyed()) this.close();
  }

  private onEnd() {
    this.webContents.send("onEnd");
  }
  private onFileSize(size?: number) {
    if (this.isDestroyed()) return;
    this.webContents.send("onFileSize", size);
  }
  private onCurSize(size: number) {
    if (this.isDestroyed()) return;
    if (this.fileSize) this.setProgressBar(size / this.fileSize);
    this.webContents.send("onDownloaded", size);
  }
  private onSpeed(speed: number) {
    if (this.isDestroyed()) return;
    this.webContents.send("onSpeed", speed);
  }
  private onResumability(state: boolean) {
    if (this.isDestroyed()) return;
    this.webContents.send("onResumeCapacity", state);
  }
  private onChangeState(state: ProgressBarState["status"]) {
    if (this.isDestroyed()) return;
    this.webContents.send("onConnectionStatus", state);
  }
}
