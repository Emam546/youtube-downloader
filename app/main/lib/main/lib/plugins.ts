import fs from "fs";
import path from "path";

import { RelatedData, ResponseData } from "../../../../../scripts/types/types";
import { app } from "electron";
const pluginDir = app.isPackaged
  ? path.join(path.dirname(app.getPath("exe")), "./scripts")
  : path.join(__dirname, "../scripts");
console.log(pluginDir);
const Order: string[] = JSON.parse(
  fs.readFileSync(path.join(pluginDir, "order.json")).toString()
);
const plugins = fs.readdirSync(pluginDir).filter((dir) => {
  const g = path.join(pluginDir, dir);
  if (!fs.statSync(g).isDirectory()) return false;
  return fs.readdirSync(g).some((val) => val.startsWith("index"));
});
export interface PluginType {
  PATH: string;
  getData: (query: Record<string, any>) => Promise<ResponseData | null>;
  navigate: (val: string) => string | null;
  search?: (val: string) => RelatedData[];
}
const Plugins = plugins
  .map<PluginType>((folder) => {
    return require(`${pluginDir}/${folder}/index`);
  })
  .sort((a, b) => {
    return (
      Order.findIndex((v) => v == a.PATH) - Order.findIndex((v) => v == b.PATH)
    );
  });
console.log(Plugins.map((v) => v.PATH));
export default Plugins;
