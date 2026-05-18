import { spawn } from "child_process";
import { YtDlpData } from "../ytdlp/data";
import os from "os";
export function getYtdlpStreams(url: string) {
  return new Promise<YtDlpData>((resolve, reject) => {
    const args = [
      url,
      "--dump-json",
      "--skip-download",
      "--socket-timeout",
      "60",
      "--check-all-formats",
      "--js-runtime",
      "node",
      "--paths",
      `TEMP:${os.tmpdir()}`,
    ];

    const proc = spawn(process.env.ytdlp_binDir!, args);

    let stdout = "";
    let stderr = "";

    proc.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    proc.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    proc.on("close", (code) => {
      if (code === 0) {
        try {
          resolve(JSON.parse(stdout));
        } catch (err) {
          reject(err);
        }
      } else {
        reject(new Error(`yt-dlp exited with code ${code}: ${stderr}`));
      }
    });

    proc.on("error", reject);
  });
}
