import fs from "fs";
import path from "path";
import { RelatedData, ResponseData } from "@scripts/types/types";
import { app } from "electron";
import { DownloadBase, DownloadParams } from "@scripts/utils/Bases";

export const pluginDir = app.isPackaged
  ? path.join(app.getPath("userData"), "scripts")
  : path.join(__dirname, "../scripts");

export interface DataType {
  apps: Record<string, number>;
  version: string;
  appVersion: string;
}
export const orderFilePath = path.join(pluginDir, "order.json");

export const Data: DataType = fs.existsSync(orderFilePath)
  ? JSON.parse(fs.readFileSync(orderFilePath).toString())
  : {
      apps: [],
      version: "v0.0.0",
    };
console.log("Scripts version", Data.version.slice(1));

const plugins = fs.existsSync(pluginDir)
  ? fs.readdirSync(pluginDir).filter((dir) => {
      const g = path.join(pluginDir, dir);
      if (!fs.statSync(g).isDirectory()) return false;
      return fs.readdirSync(g).some((val) => val.startsWith("index"));
    })
  : [];
export interface PluginType {
  PATH: string;
  getData: <T>(query: Record<string, any>) => Promise<ResponseData<T> | null>;
  navigate: (val: string) => Promise<string | null> | string | null;
  search?: (val: string) => RelatedData[];
  predictInputString: (val: Record<string, any>) => string;
  download: <T>(data: DownloadParams<T>) => DownloadBase;
}
const Plugins = plugins
  .map<PluginType>((folder) => {
    try {
      return require(`${pluginDir}/${folder}/index`);
    } catch (error) {
      console.error(error);
      return;
    }
  })
  .filter((p) => p && Data.apps[p.PATH] != undefined)
  .sort((a, b) => {
    return Data.apps[b.PATH] - Data.apps[a.PATH];
  });
console.log(
  "Apps",
  Plugins.map((v) => v.PATH)
);
export default Plugins;
