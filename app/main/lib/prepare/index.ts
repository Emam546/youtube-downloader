import { getHistoryManager } from "../downloadHistory";
import { DefinePlugins } from "../main/lib/plugins";
import {
  PrePare as PrePareScripts,
  AfterLunch as AfterLunchScripts,
} from "./pluginsUpdater";
import { updateYtDlp } from "./updateYtdlp";

export async function PrePare() {
  await PrePareScripts(); //yt-dlp is downloaded by the Scripts itself
  await DefinePlugins();
  await updateYtDlp();
  getHistory();
}
function getHistory() {
  const historyManager = getHistoryManager();
  historyManager.initialize();
}
export async function AfterLunch() {
  AfterLunchScripts();
}
