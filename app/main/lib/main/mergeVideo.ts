import {
  createMergeProgressBarWindow,
  MergeDataType,
} from "@app/main/lib/progressBar/mergeVideo";
export type { MergeDataType } from "@app/main/lib/progressBar/mergeVideo";
import { BrowserWindow } from "electron";
import { Downloader } from "./downloader";
import {
  VideoDataInfoType,
  ClippingDataType,
} from "@serv/routes/videoDownloader/api";
export interface VideoData extends VideoDataInfoType {
  mergeData: MergeDataType;
}
type VideoInfoData = ClippingDataType<VideoData>;
export async function MergeVideoData(
  e: Electron.IpcMainEvent,
  data: VideoInfoData
) {
  const window = BrowserWindow.fromWebContents(e.sender);
  if (!window) throw new Error("Undefined Window");
  const state = await Downloader(data, window);
  if (!state) return;
  if (data.clipped) {
    createMergeProgressBarWindow({
      stateData: state,
      preloadData: {
        path: state.path,
        link: data.dlink,
        video: {
          title: data.title,
          previewLink: data.previewLink,
        },
      },
      clippedData: { end: data.end, start: data.start },
      mergeData: data.mergeData,
    });
  } else
    createMergeProgressBarWindow({
      stateData: state,
      preloadData: {
        path: state.path,
        link: data.dlink,
        video: {
          title: data.title,
          previewLink: data.previewLink,
        },
      },
      mergeData: data.mergeData,
    });
}
