import { getYtDlpName } from "@utils/index";
import axios from "axios";
import { execFile } from "child_process";
import EasyDl from "easydl";
import semver from "semver";
import { pluginDir } from "../main/lib/plugins";
import { createUpdateWindow } from "../update";
import path from "path";
import fs from "fs";
const ytdlpName = getYtDlpName();
export const ytDlpPath = path.join(pluginDir, ytdlpName);
process.env.ytdlp_binDir = ytDlpPath;
export function getCurrentVersionOfytdlp() {
  return new Promise<string>((res, rej) => {
    execFile(ytDlpPath, ["--version"], (error, stdout) => {
      if (error) rej(error);
      res(stdout.trim());
    });
  });
}
const example = {
  url: "https://api.github.com/repos/yt-dlp/yt-dlp/releases/256476630",
  assets_url:
    "https://api.github.com/repos/yt-dlp/yt-dlp/releases/256476630/assets",
  upload_url:
    "https://uploads.github.com/repos/yt-dlp/yt-dlp/releases/256476630/assets{?name,label}",
  html_url: "https://github.com/yt-dlp/yt-dlp/releases/tag/2025.10.22",
  id: 256476630,
  author: {
    login: "github-actions[bot]",
    id: 41898282,
    node_id: "MDM6Qm90NDE4OTgyODI=",
    avatar_url: "https://avatars.githubusercontent.com/in/15368?v=4",
    gravatar_id: "",
    url: "https://api.github.com/users/github-actions%5Bbot%5D",
    html_url: "https://github.com/apps/github-actions",
    followers_url:
      "https://api.github.com/users/github-actions%5Bbot%5D/followers",
    following_url:
      "https://api.github.com/users/github-actions%5Bbot%5D/following{/other_user}",
    gists_url:
      "https://api.github.com/users/github-actions%5Bbot%5D/gists{/gist_id}",
    starred_url:
      "https://api.github.com/users/github-actions%5Bbot%5D/starred{/owner}{/repo}",
    subscriptions_url:
      "https://api.github.com/users/github-actions%5Bbot%5D/subscriptions",
    organizations_url:
      "https://api.github.com/users/github-actions%5Bbot%5D/orgs",
    repos_url: "https://api.github.com/users/github-actions%5Bbot%5D/repos",
    events_url:
      "https://api.github.com/users/github-actions%5Bbot%5D/events{/privacy}",
    received_events_url:
      "https://api.github.com/users/github-actions%5Bbot%5D/received_events",
    type: "Bot",
    user_view_type: "public",
    site_admin: false,
  },
  node_id: "RE_kwDOElBrLc4PSYXW",
  tag_name: "2025.10.22",
  target_commitish: "a75399d89f90b249ccfda148987e10bc688e2f84",
  name: "yt-dlp 2025.10.22",
  draft: false,
  immutable: true,
  prerelease: false,
  created_at: "2025-10-22T19:42:16Z",
  updated_at: "2025-10-22T19:51:39Z",
  published_at: "2025-10-22T19:51:38Z",
  assets: [
    {
      url: "https://api.github.com/repos/yt-dlp/yt-dlp/releases/assets/307436714",
      id: 307436714,
      node_id: "RA_kwDOElBrLc4SUxyq",
      name: "SHA2-256SUMS",
      label: "",
      uploader: {
        login: "github-actions[bot]",
        id: 41898282,
        node_id: "MDM6Qm90NDE4OTgyODI=",
        avatar_url: "https://avatars.githubusercontent.com/in/15368?v=4",
        gravatar_id: "",
        url: "https://api.github.com/users/github-actions%5Bbot%5D",
        html_url: "https://github.com/apps/github-actions",
        followers_url:
          "https://api.github.com/users/github-actions%5Bbot%5D/followers",
        following_url:
          "https://api.github.com/users/github-actions%5Bbot%5D/following{/other_user}",
        gists_url:
          "https://api.github.com/users/github-actions%5Bbot%5D/gists{/gist_id}",
        starred_url:
          "https://api.github.com/users/github-actions%5Bbot%5D/starred{/owner}{/repo}",
        subscriptions_url:
          "https://api.github.com/users/github-actions%5Bbot%5D/subscriptions",
        organizations_url:
          "https://api.github.com/users/github-actions%5Bbot%5D/orgs",
        repos_url: "https://api.github.com/users/github-actions%5Bbot%5D/repos",
        events_url:
          "https://api.github.com/users/github-actions%5Bbot%5D/events{/privacy}",
        received_events_url:
          "https://api.github.com/users/github-actions%5Bbot%5D/received_events",
        type: "Bot",
        user_view_type: "public",
        site_admin: false,
      },
      content_type: "application/octet-stream",
      state: "uploaded",
      size: 1595,
      digest:
        "sha256:8019de67fcaeba68b6b2a876402a054fbb27a48172cef84df7cf8cc0f2498358",
      download_count: 434309,
      created_at: "2025-10-22T19:51:29Z",
      updated_at: "2025-10-22T19:51:29Z",
      browser_download_url:
        "https://github.com/yt-dlp/yt-dlp/releases/download/2025.10.22/SHA2-256SUMS",
    },
  ],
};
type Release = typeof example;
export async function updateYtDlp() {
  const response = await axios.get<Release>(
    "https://api.github.com/repos/yt-dlp/yt-dlp/releases/latest"
  );
  if (fs.existsSync(ytDlpPath)) {
    try {
      const currentVersion = await getCurrentVersionOfytdlp();
      console.log("Yt-dlp current version", currentVersion);
      if (!semver.lt(currentVersion, response.data.tag_name)) return;
    } catch (error) {
      console.error(error);
    }
  }
  const asset = response.data.assets.find((val) => val.name == ytdlpName);
  if (!asset) throw new Error(`unrecognized asset ${ytdlpName}`);
  const win = await createUpdateWindow({
    preloadData: {
      curSize: 0,
      fileSize: asset.size,
      message: "Downloading Yt-dlp ...",
    },
  });
  win.setFileSize(asset.size);
  const download = new EasyDl(asset.browser_download_url, ytDlpPath);
  download.on("progress", (progress) => {
    win.setFileSize(progress.total.bytes!);
  });
  download.on("error", (e) => {
    win.error(e);
  });
  await download.wait();
  win.close();
}
