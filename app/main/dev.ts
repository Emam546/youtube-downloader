import { createClippedProgressBarWindow } from "./lib/progressBar/ffmpeg";
import app from "./index";
import { createUpdateWindow } from "./lib/update";
import { autoUpdater } from "electron-updater";
const link = "https://www.w3schools.com/html/mov_bbb.mp4";
const start = 100;
const end = 3 + start;
const output = "newExample.mp4";
const ThrottleSpeed = 1024 * 5;
async function ContinuedWithThrottle() {
  const win = await createClippedProgressBarWindow({
    preloadData: {
      link: link,
      path: output,
      video: {
        title: "Title",
        vid: "id",
      },
    },
    stateData: {
      path: output,
      continued: false,
    },
    clippedData: {
      start,
      end,
    },
    downloadingStatus: {
      downloadSpeed: ThrottleSpeed,
      enableThrottle: true,
    },
  });
  // win.trigger(false);
  await new Promise<void>((res) => {
    win.on("closed", () => {
      res();
    });
  });
}
app.on("ready", async () => {
  // await ContinuedWithThrottle();
  // await createUpdateWindow({
  //   preloadData: {
  //     curSize: 40,
  //     fileSize: 100,
  //   },
  //   autoUpdater,
  // });
});
