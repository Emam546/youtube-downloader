import { VideoDataClippedType, getFileName } from "@utils/server";
import { BrowserWindow, dialog } from "electron";
import fs from "fs-extra";
export interface Options {
  title: string;
  quality: string;
  type: string;
}
export interface StateType {
  path: string;
  continued: boolean;
}
export async function GetFilePath(fileName: string) {
  const { canceled, filePath: newpath } = await dialog.showSaveDialog({
    title: "Download Image",
    defaultPath: fileName,
    buttonLabel: "Save",
    properties: ["showOverwriteConfirmation", "createDirectory"],
    showsTagField: false,
  });
  if (canceled || !newpath) return null;
  return newpath;
}
export async function Downloader<T>(
  data: VideoDataClippedType<T>,
  window: BrowserWindow
) {
  const Name = getFileName(data);
  const { canceled, filePath: newpath } = await dialog.showSaveDialog({
    title: "Download Video",
    defaultPath: Name,
    buttonLabel: "Save",
    properties: ["showOverwriteConfirmation", "createDirectory"],
    showsTagField: false,
  });
  if (canceled || !newpath) return;
  let continued = false;
  if (fs.pathExistsSync(newpath)) {
    const { response } = await dialog.showMessageBox(window, {
      type: "question",
      buttons: ["Yes             ", "No, redownload the video"],
      title: "Save",
      defaultId: 0,
      cancelId: 1,
      message: "Do you want to start from where it stopped downloading",
    });
    continued = response == 0;
  }
  return {
    path: newpath,
    continued,
  };
}
