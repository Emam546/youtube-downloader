import { DefinePlugins } from "../main/lib/plugins";
import {
  PrePare as PrePareScripts,
  AfterLunch as AfterLunchScripts,
} from "./pluginsUpdater";
import { updateYtDlp } from "./updateYtdlp";

export async function PrePare() {
  await PrePareScripts();
  await updateYtDlp(); //yt-dlp is downloaded by the Scripts itself
  await DefinePlugins();
}
export async function AfterLunch() {
  AfterLunchScripts();
}
