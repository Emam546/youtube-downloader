import {
  PrePare as PrePareScripts,
  AfterLunch as AfterLunchScripts,
} from "./pluginsUpdater";
export async function PrePare() {
  PrePareScripts();
}
export async function AfterLunch() {
  AfterLunchScripts();
}
