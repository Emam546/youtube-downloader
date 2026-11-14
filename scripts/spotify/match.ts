import { spawn } from "child_process";
import { SpotifyTrack } from "./metadata";

export interface YoutubeCandidate {
  id?: string;
  title?: string;
  duration?: number | null;
  channel?: string;
  uploader?: string;
  artist?: string;
}

export interface YoutubeMatch {
  id: string;
  title: string;
  url: string;
  duration?: number;
}

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const PENALTIES = ["karaoke", "cover", "remix", "live", "nightcore", "sped up"];

export interface FindMatchOptions {
  /** Path to the yt-dlp binary. Defaults to ytdlp_binDir or yt-dlp. */
  binaryPath?: string;
  /** Netscape cookies file passed to yt-dlp. */
  cookies?: string;
  /** Number of YouTube search results to score. */
  limit?: number;
  /** Extra arguments appended to the yt-dlp search command. */
  extraArgs?: string[];
}

export function scoreMatch(track: SpotifyTrack, entry: YoutubeCandidate): number {
  const title = normalize(entry.title || "");
  const wanted = normalize(track.title);
  const artists = normalize(track.artists);
  const channel = normalize(entry.channel || entry.uploader || entry.artist || "");
  if (!title || !wanted) return 0;

  let score = 0;
  if (title.includes(wanted)) score += 50;
  else {
    const words = wanted.split(" ").filter((word) => word.length > 2);
    const hits = words.filter((word) => title.includes(word)).length;
    score += words.length ? Math.round((hits / words.length) * 30) : 0;
  }
  if (artists && (title.includes(artists) || channel.includes(artists))) {
    score += 30;
  } else if (artists) {
    const names = artists.split(" ").filter((word) => word.length > 2);
    if (names.some((name) => title.includes(name) || channel.includes(name))) {
      score += 15;
    }
  }
  if (track.durationMs && entry.duration) {
    const diff = Math.abs(entry.duration - track.durationMs / 1000);
    if (diff <= 3) score += 40;
    else if (diff <= 8) score += 25;
    else if (diff <= 20) score += 10;
    else score -= 25;
  }
  for (const word of PENALTIES) {
    if (title.includes(word) && !wanted.includes(word)) score -= 35;
  }
  if (title.includes("official audio") || title.includes("audio")) score += 8;
  return score;
}

function resolveYtdlp(explicit?: string) {
  return explicit || process.env.ytdlp_binDir || "yt-dlp";
}

function runYtdlp(args: string[], binaryPath?: string) {
  const bin = resolveYtdlp(binaryPath);
  return new Promise<string>((resolve, reject) => {
    const proc = spawn(bin, args);
    let stdout = "";
    let stderr = "";
    proc.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });
    proc.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });
    proc.on("error", reject);
    proc.on("close", (code) => {
      if (code === 0) resolve(stdout);
      else reject(new Error(`yt-dlp exited with code ${code}: ${stderr}`));
    });
  });
}

export async function findYoutubeMatch(
  track: SpotifyTrack,
  options: FindMatchOptions = {},
): Promise<YoutubeMatch | null> {
  const query = `${track.artists} ${track.title}`.replace(/\s+/g, " ").trim();
  const limit = Math.max(1, Math.floor(options.limit || 8));
  const args = [
    `ytsearch${limit}:${query}`,
    "--flat-playlist",
    "--dump-single-json",
    "--skip-download",
    "--no-warnings",
    "--socket-timeout",
    "30",
    "--js-runtime",
    "node",
  ];
  if (options.cookies) args.push("--cookies", options.cookies);
  if (options.extraArgs?.length) args.push(...options.extraArgs);

  const stdout = await runYtdlp(args, options.binaryPath);
  const parsed = JSON.parse(stdout) as { entries?: YoutubeCandidate[] };
  const entries = parsed.entries || [];
  let best: { entry: YoutubeCandidate; score: number } | null = null;
  for (const entry of entries) {
    const score = scoreMatch(track, entry);
    if (!best || score > best.score) best = { entry, score };
  }
  if (!best || best.score < 25 || !best.entry.id) return null;
  return {
    id: best.entry.id,
    title: best.entry.title || track.title,
    url: `https://www.youtube.com/watch?v=${best.entry.id}`,
    duration: best.entry.duration || undefined,
  };
}
