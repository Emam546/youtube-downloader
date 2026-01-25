import { getYtDlpName } from "@utils/index";

import { pluginDir } from "../main/lib/plugins";
import { createUpdateWindow } from "../update";
import path from "path";
import { updateYtDlp as orgupdateYtDlp } from "@utils/updateYtdlp";
const ytdlpName = getYtDlpName();
export const ytDlpPath = path.join(pluginDir, ytdlpName);
process.env.ytdlp_binDir = ytDlpPath;
export async function updateYtDlp(silent: boolean = true) {
  try {
    const download = await orgupdateYtDlp(ytDlpPath);
    if (!download) return;
    if (!silent) {
      const win = await createUpdateWindow({
        preloadData: {
          curSize: 0,
          fileSize: download.size,
          message: "Downloading Yt-dlp ...",
        },
      });
      win.setFileSize(download.size);
      download.on("progress", (progress) => {
        win.setFileSize(progress.total.bytes!);
      });
      download.on("error", (e) => {
        win.error(e);
      });
      download.on("close", () => win.close());
    }

    await download.wait();
  } catch (error) {
    console.error(error);
  }
}
