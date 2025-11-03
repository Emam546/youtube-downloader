import path from "path";
import { app } from "electron";
import { DataType, PluginType } from "@scripts/plugins";
import fs from "fs";
export const pluginDir = app.isPackaged
  ? path.join(app.getPath("userData"), "scripts")
  : path.join(__dirname, "../scripts");
const orderFilePath = path.join(pluginDir, "order.json");

export const Data: DataType = fs.existsSync(orderFilePath)
  ? JSON.parse(fs.readFileSync(orderFilePath).toString())
  : {
      apps: [],
      version: "v0.0.0",
    };
console.log("Scripts version", Data.version.slice(1));
export const plugins = fs.existsSync(pluginDir)
  ? fs.readdirSync(pluginDir).filter((dir) => {
      const g = path.join(pluginDir, dir);
      if (!fs.statSync(g).isDirectory()) return false;
      return fs.readdirSync(g).some((val) => val.startsWith("index"));
    })
  : [];
export const Plugins = plugins
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
