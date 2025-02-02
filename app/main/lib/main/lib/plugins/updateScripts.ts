import fs from "fs";
import path from "path";
import unzipper from "unzipper";
import https from "https";
import { HttpsDownloadAgent } from "@serv/util/axios";
export function updateScripts(url: string, pathDir: string) {
  return new Promise<void>((result, reject) => {
    https.get(
      url,
      {
        agent: HttpsDownloadAgent,
      },
      (res) => {
        if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400) {
          updateScripts(res.headers["location"] as string, pathDir)
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
