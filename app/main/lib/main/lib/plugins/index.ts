import fs from "fs";
import path from "path";
import semver from "semver";
import { publish } from "../../../../../../package.json";
import { RelatedData, ResponseData } from "@scripts/types/types";
import { app } from "electron";
import axios from "axios";
import { updateScripts as updateScripts } from "./updateScripts";
import { isDev } from "@app/main/utils";
const pluginDir = app.isPackaged
  ? path.join(path.dirname(app.getPath("exe")), "./scripts")
  : path.join(__dirname, "../scripts");
interface DataType {
  apps: Record<string, number>;
  version: string;
}
const orderFilePath = path.join(pluginDir, "order.json");
const Data: DataType = JSON.parse(fs.readFileSync(orderFilePath).toString());
console.log("Scripts version", Data.version.slice(1));

(async function () {
  const res = await axios.get<DataType>(
    `https://raw.githubusercontent.com/${publish.owner}/${publish.repo}/scripts/order.json`
  );
  console.log("Remote scripts version", res.data.version);
  if (semver.lte(res.data.version, Data.version)) return;
  console.log("Scripts update available");
  const DOWNLOAD_URL = `https://github.com/${publish.owner}/${publish.repo}/archive/refs/heads/scripts.zip`;
  await updateScripts(DOWNLOAD_URL, pluginDir);
  fs.writeFileSync(
    orderFilePath,
    JSON.stringify({
      ...res.data,
      apps: { ...Data.apps, ...res.data.apps },
    } as DataType)
  );
  app.quit();
  app.relaunch();
})();

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
    return Data.apps[b.PATH] - Data.apps[a.PATH];
  });
console.log(
  "Apps",
  Plugins.map((v) => v.PATH)
);
export default Plugins;
