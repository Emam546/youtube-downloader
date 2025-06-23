import fs from "fs";
import path from "path";
import unzipper from "unzipper";
import https from "https";
import { HttpsDownloadAgent } from "@serv/util/axios";
import { pluginDir, orderFilePath, DataType, Data } from "../main/lib/plugins";
import semver from "semver";
import { publish } from "../../../../package.json";
import axios from "axios";
import { app } from "electron";
function downloadFile(url: string, pathDir: string) {
  return new Promise<void>((result, reject) => {
    https.get(
      url,
      {
        agent: HttpsDownloadAgent,
      },
      (res) => {
        if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400) {
          downloadFile(res.headers["location"] as string, pathDir)
            .then(result)
            .catch(reject);
          return;
        }
        if (!res.statusCode || res.statusCode >= 300) reject(res.statusMessage);
        res
          .pipe(unzipper.Parse({ path: pathDir }))
          .on("entry", (entry) => {
            const fileName = entry.path.split("/").slice(1).join("/"); // Skip top-level folder
            const outputPath = path.join(pathDir, fileName);
            const dir = path.dirname(outputPath);
            if (entry.type === "File" && fileName != "order.json") {
              if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
              entry.pipe(fs.createWriteStream(outputPath));
            } else {
              entry.autodrain(); // Skip directories
            }
          })
          .on("close", () => {
            result();
          });
      }
    );
  });
}
export async function PrePare() {
  if (fs.existsSync(orderFilePath)) return;
  fs.mkdirSync(pluginDir, { recursive: true });
  await updateScripts();
}
export async function AfterLunch() {
  await updateScripts();
}
async function updateScripts() {
  const res = await axios.get<DataType>(
    `https://raw.githubusercontent.com/${publish.owner}/${publish.repo}/scripts/order.json`
  );
  console.log("Remote scripts version", res.data.version);
  if (semver.lte(res.data.version, Data.version)) return;
  console.log("Scripts update available");
  const DOWNLOAD_URL = `https://github.com/${publish.owner}/${publish.repo}/archive/refs/heads/scripts.zip`;
  await downloadFile(DOWNLOAD_URL, pluginDir);
  fs.writeFileSync(
    orderFilePath,
    JSON.stringify({
      ...res.data,
      apps: { ...Data.apps, ...res.data.apps },
    } as DataType)
  );
  app.quit();
  app.relaunch();
}
