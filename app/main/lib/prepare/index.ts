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
}
export async function AfterLunch() {
  AfterLunchScripts();
}
