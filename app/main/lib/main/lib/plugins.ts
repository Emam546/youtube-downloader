import path from "path";
import { app } from "electron";
import { DataType, PluginType } from "@scripts/plugins";
import fs from "fs";
export const pluginDir = app.isPackaged
  ? path.join(app.getPath("userData"), "scripts")
  : path.join(__dirname, "../scripts");
export const orderFilePath = path.join(pluginDir, "order.json");

export const Plugins: PluginType[] = [];
export function getPluginsData() {
  const Data: DataType = fs.existsSync(orderFilePath)
    ? JSON.parse(fs.readFileSync(orderFilePath).toString())
    : {
        apps: [],
        version: "v0.0.0",
      };
  return Data;
}
export async function DefinePlugins() {
  Plugins.length = 0;
  const Data = getPluginsData();
  const plugins = fs.existsSync(pluginDir)
    ? fs.readdirSync(pluginDir).filter((dir) => {
        const g = path.join(pluginDir, dir);
        const reqPath = require.resolve(g);
        if (require.cache[reqPath]) delete require.cache[reqPath];
        if (!fs.statSync(g).isDirectory()) return false;
        return fs.readdirSync(g).some((val) => val.startsWith("index"));
      })
    : [];
  Promise.all(
    plugins.map<Promise<PluginType>>(async (folder) => {
      try {
        return require(`${pluginDir}/${folder}/index`);
      } catch (error) {
        console.error(error);
        return;
      }
    })
  ).then((plugins) => {
    plugins
      .filter((p) => p && Data.apps[p.PATH] != undefined)
      .sort((a, b) => {
        return Data.apps[b.PATH] - Data.apps[a.PATH];
      })
      .forEach((v) => Plugins.push(v));
    console.log(
      "Apps",
      Plugins.map((v) => v.PATH)
    );
  });
}
