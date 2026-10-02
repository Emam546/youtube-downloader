/**
 * Download the latest browser extension from GitHub releases
 */

import https from "https";
import http from "http";
import fs from "fs-extra";
import path from "path";
import unzipper from "unzipper";

const EXTENSION_REPO = "Emam546/youtube-downloader-browser-extension";
const RESOURCES_DIR = path.join(process.cwd(), "resources", "browser-extension");
const EXTENSION_DIR = path.join(RESOURCES_DIR, "chrome-built");
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;

async function getLatestRelease(): Promise<{ tag: string; downloadUrl: string }> {
  return new Promise((resolve, reject) => {
    const url = `https://api.github.com/repos/${EXTENSION_REPO}/releases/latest`;

    const headers: Record<string, string> = {
      "User-Agent": "youtube-downloader-build",
    };

    // Add GitHub token if available to avoid rate limiting
    if (GITHUB_TOKEN) {
      headers["Authorization"] = `token ${GITHUB_TOKEN}`;
    }

    https
      .get(
        url,
        {
          headers,
        },
        (res) => {
          let data = "";

          res.on("data", (chunk) => {
            data += chunk;
          });

          res.on("end", () => {
            try {
              if (res.statusCode !== 200) {
                reject(new Error(`GitHub API returned status ${res.statusCode}: ${data}`));
                return;
              }

              const release = JSON.parse(data);
              const chromeAsset = release.assets.find(
                (asset: any) => asset.name.endsWith(".zip") && asset.name.includes("chrome")
              );

              if (!chromeAsset) {
                reject(new Error("No Chrome extension zip found in latest release"));
                return;
              }

              resolve({
                tag: release.tag_name,
                downloadUrl: chromeAsset.browser_download_url,
              });
            } catch (err) {
              reject(err);
            }
          });
        }
      )
      .on("error", reject);
  });
}

async function downloadFile(url: string, dest: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    const protocol = url.startsWith("https") ? https : http;

    protocol.get(
      url,
      {
        headers: {
          "User-Agent": "youtube-downloader-build",
        },
      },
      (response) => {
        // Handle redirects
        if (response.statusCode === 301 || response.statusCode === 302) {
          const redirectUrl = response.headers.location;
          if (redirectUrl) {
            file.close();
            fs.unlink(dest, () => {});
            downloadFile(redirectUrl, dest).then(resolve).catch(reject);
            return;
          }
        }

        if (response.statusCode !== 200) {
          file.close();
          fs.unlink(dest, () => {});
          reject(new Error(`Download failed with status ${response.statusCode}`));
          return;
        }

        response.pipe(file);

        file.on("finish", () => {
          file.close();
          resolve();
        });
      }
    ).on("error", (err) => {
      file.close();
      fs.unlink(dest, () => {}); // Delete the file if there was an error
      reject(err);
    });
  });
}

async function extractZip(zipPath: string, dest: string): Promise<void> {
  try {
    // Create destination directory if it doesn't exist
    await fs.ensureDir(dest);

    // Remove existing extension directory
    if (await fs.pathExists(dest)) {
      await fs.remove(dest);
    }

    // Use unzipper to extract
    await fs.createReadStream(zipPath).pipe(
      unzipper.Extract({
        path: dest,
      })
    ).promise();
  } catch (err) {
    throw new Error(`Failed to extract zip: ${err}`);
  }
}

async function main() {
  try {
    console.log("Fetching latest browser extension release...");
    const { tag, downloadUrl } = await getLatestRelease();
    console.log(`Latest release: ${tag}`);
    console.log(`Download URL: ${downloadUrl}`);

    // Ensure resources directory exists
    await fs.ensureDir(RESOURCES_DIR);

    const zipPath = path.join(RESOURCES_DIR, "extension.zip");

    console.log("Downloading extension...");
    await downloadFile(downloadUrl, zipPath);
    console.log("Download complete");

    console.log("Extracting extension...");
    await extractZip(zipPath, EXTENSION_DIR);
    console.log("Extraction complete");

    // Clean up zip file
    await fs.remove(zipPath);
    console.log("Cleaned up zip file");

    console.log("Browser extension downloaded and extracted successfully!");
  } catch (err) {
    console.error("Error downloading browser extension:", err);
    process.exit(1);
  }
}

main();
