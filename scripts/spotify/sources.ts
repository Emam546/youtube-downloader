import axios from "axios";
import { Media } from "../types/types";
import { getYtdlpStreams } from "../utils/func";
import { FormatResult, YtdlpData } from "../utils/Bases/ytdlp";
import { normalize, runYtdlp, scoreMatch } from "./match";
import { SpotifyTrack } from "./metadata";
import { PATH } from "./valid";

export type SourceName = "Bandcamp" | "SoundCloud" | "Audius";

export interface SourceCandidate {
  source: SourceName;
  title: string;
  artist?: string;
  url: string;
  duration?: number;
  thumbnail?: string;
}

export interface RankedCandidate {
  candidate: SourceCandidate;
  score: number;
}

export interface ResolvedFormat extends FormatResult {
  link: string;
}

export interface ResolvedSource {
  candidate: SourceCandidate;
  score: number;
  format: ResolvedFormat;
}

export interface SourceAttempt {
  source: SourceName;
  candidates: number;
  resolved: boolean;
  error?: string;
}

export interface AudioSourceResult {
  resolved: ResolvedSource[];
  attempts: SourceAttempt[];
}

/** Minimal yt-dlp format shape used by the resolver. */
export interface RawAudioFormat {
  format_id?: string | null;
  url?: string | null;
  ext?: string | null;
  acodec?: string | null;
  vcodec?: string | null;
  abr?: number | null;
  tbr?: number | null;
  quality?: number | null;
  filesize?: number | null;
  filesize_approx?: number | null;
  has_drm?: boolean | null;
}

/** Minimal yt-dlp info shape used by the resolver. */
export interface RawAudioInfo {
  formats?: RawAudioFormat[] | null;
  url?: string | null;
  ext?: string | null;
  acodec?: string | null;
  vcodec?: string | null;
  abr?: number | null;
  tbr?: number | null;
  quality?: number | null;
  filesize?: number | null;
  filesize_approx?: number | null;
  format_id?: string | null;
  duration?: number | null;
  has_drm?: boolean | null;
  _has_drm?: boolean | null;
}

export type SourceSearcher = (
  track: SpotifyTrack,
  limit: number,
) => Promise<SourceCandidate[]>;

export type FormatResolver = (url: string) => Promise<RawAudioInfo>;

export interface SourceSearch {
  source: SourceName;
  search: SourceSearcher;
}

export interface FindAudioSourcesOptions {
  /** Number of search results requested from each source. Defaults to 6. */
  limit?: number;
  /** Minimum match score for a candidate to be considered. Defaults to 60. */
  minScore?: number;
  /** How many candidates per source may be resolved before giving up. */
  maxPerSource?: number;
  /** Override the source searches, mainly for tests. */
  searches?: SourceSearch[];
  /** Override the yt-dlp format lookup, mainly for tests. */
  resolve?: FormatResolver;
}

const EXTRA_PENALTIES = [
  "slowed",
  "reverb",
  "instrumental",
  "bass boosted",
  "8d audio",
];

function searchQuery(track: SpotifyTrack) {
  return `${track.artists} ${track.title}`.replace(/\s+/g, " ").trim();
}

function largestThumbnail(
  thumbnails?: { url?: string; width?: number; id?: string }[],
): string | undefined {
  if (!thumbnails?.length) return undefined;
  const sorted = [...thumbnails].sort((a, b) => (b.width || 0) - (a.width || 0));
  return sorted.find((thumbnail) => thumbnail.url)?.url;
}

function bandcampImage(image?: string | null) {
  if (!image) return undefined;
  // Bandcamp serves small previews from the search endpoint. _10 is 1200px.
  return image.replace(/_3\.jpg$/i, "_10.jpg");
}

export function candidateFromSoundcloud(
  entry: Record<string, unknown>,
): SourceCandidate | null {
  const url =
    (typeof entry.webpage_url === "string" && entry.webpage_url) ||
    (typeof entry.url === "string" && entry.url.startsWith("http")
      ? entry.url
      : "");
  const title =
    (typeof entry.title === "string" && entry.title) ||
    (typeof entry.track === "string" && entry.track) ||
    "";
  if (!url || !title) return null;
  return {
    source: "SoundCloud",
    title,
    artist:
      (typeof entry.uploader === "string" && entry.uploader) ||
      (Array.isArray(entry.artists) && typeof entry.artists[0] === "string"
        ? entry.artists[0]
        : undefined),
    url,
    duration:
      typeof entry.duration === "number" ? entry.duration : undefined,
    thumbnail: largestThumbnail(
      entry.thumbnails as { url?: string; width?: number; id?: string }[],
    ),
  };
}

function bandcampUrl(input: unknown): string {
  if (typeof input !== "string" || !input) return "";
  // app_autocomplete returns a doubled URL; keep the last absolute URL.
  const index = input.lastIndexOf("https://");
  return index > 0 ? input.slice(index) : input;
}

export function candidateFromBandcamp(
  result: Record<string, unknown>,
): SourceCandidate | null {
  const url = bandcampUrl(result.item_url_path || result.url);
  const title = (typeof result.name === "string" && result.name) || "";
  if (!url || !title) return null;
  return {
    source: "Bandcamp",
    title,
    artist:
      (typeof result.band_name === "string" && result.band_name) || undefined,
    url,
    thumbnail: bandcampImage(
      typeof result.img === "string" ? result.img : undefined,
    ),
  };
}

export async function searchSoundcloud(
  track: SpotifyTrack,
  limit = 6,
): Promise<SourceCandidate[]> {
  const args = [
    `scsearch${Math.max(1, Math.floor(limit))}:${searchQuery(track)}`,
    "--flat-playlist",
    "--dump-single-json",
    "--skip-download",
    "--no-warnings",
    "--socket-timeout",
    "30",
    "--js-runtime",
    "node",
  ];
  const stdout = await runYtdlp(args);
  const parsed = JSON.parse(stdout) as { entries?: Record<string, unknown>[] };
  return (parsed.entries || [])
    .map(candidateFromSoundcloud)
    .filter((candidate): candidate is SourceCandidate => candidate != null)
    .slice(0, limit);
}

export async function searchBandcamp(
  track: SpotifyTrack,
  limit = 6,
): Promise<SourceCandidate[]> {
  const query = searchQuery(track);
  let results: Record<string, unknown>[] = [];

  // Bandcamp's search box API. Use the global fetch implementation: axios'
  // Node HTTP fingerprint is served a bot "Client Challenge" page instead.
  try {
    const response = await fetch(
      "https://bandcamp.com/api/bcsearch_public_api/1/autocomplete_elastic",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        },
        body: JSON.stringify({
          search_text: query,
          search_filter: "t",
          full_page: false,
          fan_id: null,
        }),
      },
    );
    if (response.ok) {
      const data = (await response.json()) as {
        auto?: { results?: Record<string, unknown>[] };
      };
      results = data.auto?.results || [];
    }
  } catch {
    results = [];
  }

  if (!results.length) {
    try {
      const response = await fetch(
        `https://bandcamp.com/api/fuzzysearch/1/app_autocomplete?q=${encodeURIComponent(
          query,
        )}`,
      );
      if (response.ok) {
        const data = (await response.json()) as {
          results?: Record<string, unknown>[];
        };
        results = (data.results || []).filter(
          (item) => item && item.type === "t",
        );
      }
    } catch {
      results = [];
    }
  }

  return results
    .map(candidateFromBandcamp)
    .filter((candidate): candidate is SourceCandidate => candidate != null)
    .slice(0, Math.max(limit, 20));
}

export interface AudiusTrack {
  title?: string;
  permalink?: string;
  duration?: number;
  is_streamable?: boolean;
  is_available?: boolean;
  is_delete?: boolean;
  user?: { name?: string; handle?: string };
  artwork?: Record<string, string>;
}

export function candidateFromAudius(
  item: AudiusTrack,
): SourceCandidate | null {
  if (
    !item.title ||
    !item.permalink ||
    item.is_streamable === false ||
    item.is_available === false ||
    item.is_delete === true
  ) {
    return null;
  }
  const artwork = item.artwork || {};
  return {
    source: "Audius",
    title: item.title,
    artist: item.user?.name || item.user?.handle || undefined,
    url: `https://audius.co${item.permalink}`,
    duration: typeof item.duration === "number" ? item.duration : undefined,
    thumbnail:
      artwork["480x480"] || artwork["150x150"] || artwork["1000x1000"],
  };
}

export async function searchAudius(
  track: SpotifyTrack,
  limit = 6,
): Promise<SourceCandidate[]> {
  const response = await axios.get<{
    data?: AudiusTrack[];
  }>("https://api.audius.co/v1/tracks/search", {
    params: {
      query: searchQuery(track),
      app_name: "youtube-downloader",
      limit: Math.max(1, Math.floor(limit)),
    },
    timeout: 15000,
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      Accept: "application/json",
    },
  });
  return (response.data.data || [])
    .map(candidateFromAudius)
    .filter((candidate): candidate is SourceCandidate => candidate != null)
    .slice(0, limit);
}

export function defaultSearches(): SourceSearch[] {
  return [
    { source: "SoundCloud", search: searchSoundcloud },
    { source: "Bandcamp", search: searchBandcamp },
    { source: "Audius", search: searchAudius },
  ];
}

/**
 * A 30-second SoundCloud preview cannot stand in for a full track. Reject any
 * result that is dramatically shorter than the Spotify metadata.
 */
export function isPreviewDuration(
  track: SpotifyTrack,
  duration?: number | null,
): boolean {
  if (!track.durationMs || !duration) return false;
  const full = track.durationMs / 1000;
  if (full < 90) return false;
  return duration <= 45 && duration < full * 0.5;
}

export function scoreCandidate(
  track: SpotifyTrack,
  candidate: SourceCandidate,
): number {
  if (isPreviewDuration(track, candidate.duration)) return 0;

  let score = scoreMatch(track, {
    title: candidate.title,
    duration: candidate.duration,
    channel: candidate.artist,
    uploader: candidate.artist,
  });

  const title = candidate.title.toLowerCase();
  const wanted = track.title.toLowerCase();
  for (const word of EXTRA_PENALTIES) {
    if (title.includes(word) && !wanted.includes(word)) score -= 25;
  }

  // Prefer the artist's own upload over covers and compilations that merely
  // mention the artist in the title.
  const wantedArtist = normalize(track.artists);
  const candidateArtist = normalize(candidate.artist || "");
  if (
    wantedArtist &&
    candidateArtist &&
    (candidateArtist === wantedArtist ||
      candidateArtist.includes(wantedArtist) ||
      wantedArtist.includes(candidateArtist))
  ) {
    score += 20;
  }

  if (track.durationMs && candidate.duration) {
    const diff = Math.abs(candidate.duration - track.durationMs / 1000);
    if (diff <= 3) score += 10;
    else if (diff > 40) score -= 20;
  }
  return Math.max(0, score);
}

/**
 * Scores every candidate and keeps the best few per source, ranked from most to
 * least likely to be the same recording.
 */
export function rankCandidates(
  track: SpotifyTrack,
  candidates: SourceCandidate[],
  minScore = 60,
  maxPerSource = 2,
): RankedCandidate[][] {
  const groups = new Map<SourceName, RankedCandidate[]>();
  const seen = new Set<string>();

  for (const candidate of candidates) {
    if (seen.has(candidate.url)) continue;
    seen.add(candidate.url);
    const score = scoreCandidate(track, candidate);
    if (score < minScore) continue;
    const group = groups.get(candidate.source) || [];
    group.push({ candidate, score });
    groups.set(candidate.source, group);
  }

  return [...groups.values()].map((group) =>
    group.sort((a, b) => b.score - a.score).slice(0, maxPerSource),
  );
}

function isAudioOnly(format: RawAudioFormat) {
  return (
    !!format.url &&
    !!format.acodec &&
    format.acodec !== "none" &&
    (!format.vcodec || format.vcodec === "none") &&
    format.has_drm !== true
  );
}

function buildFormat(
  source: RawAudioFormat,
  info: RawAudioInfo,
): ResolvedFormat {
  const ext = source.ext || info.ext || "mp3";
  const formatId = source.format_id || info.format_id || "bestaudio/best";
  return {
    ...source,
    link: "",
    format_id: formatId,
    ext,
    type: ext,
    has_audio: true,
    has_video: false,
    args: { format: formatId },
  } as ResolvedFormat;
}

/**
 * Picks the highest quality audio-only format from a resolved yt-dlp payload.
 */
export function pickBestAudioFormat(
  info: RawAudioInfo,
): ResolvedFormat | null {
  const formats = Array.isArray(info.formats) ? info.formats : [];
  const audio = formats
    .filter(isAudioOnly)
    .sort(
      (a, b) =>
        (b.abr || b.tbr || 0) - (a.abr || a.tbr || 0) ||
        (b.filesize_approx || b.filesize || 0) -
          (a.filesize_approx || a.filesize || 0),
    );
  if (audio.length) return buildFormat(audio[0], info);

  // Audius reports a single selected stream without a formats array.
  if (info.url && info.acodec && info.acodec !== "none") {
    return buildFormat(info as RawAudioFormat, info);
  }
  return null;
}

export function mediaForSource(
  track: SpotifyTrack,
  resolved: ResolvedSource,
): Media<YtdlpData> {
  const format = resolved.format;
  const link = resolved.candidate.url;
  const ext = format.ext || "mp3";
  const abr = Math.round(format.abr || format.tbr || 0);
  const title = track.artists
    ? `${track.artists} - ${track.title}`
    : track.title;
  const ytdlpData = { ...format, link } as FormatResult & { link: string };

  return {
    previewLink: link,
    container: ext,
    environment: ["desktop", "web"],
    size: format.filesize || format.filesize_approx || undefined,
    data: {
      data: { ytdlpData },
      fquality: abr ? `${abr}kbps` : format.format_id,
      ftype: ext,
      PATH,
      previewLink: link,
      title,
    },
    text: {
      str: `${resolved.candidate.source} - ${ext.toUpperCase()}${
        abr ? ` (${abr}kbps)` : ""
      }`,
      label: { color: "green", str: resolved.candidate.source },
    },
    quality: abr,
    id: `${track.id}_${resolved.candidate.source.toLowerCase()}`,
  };
}

async function resolveGroup(
  track: SpotifyTrack,
  group: RankedCandidate[],
  attempt: SourceAttempt,
  resolve: FormatResolver,
): Promise<ResolvedSource | null> {
  let lastError: string | undefined;
  for (const { candidate, score } of group) {
    try {
      const info = await resolve(candidate.url);
      const duration =
        typeof info.duration === "number" ? info.duration : candidate.duration;
      if (isPreviewDuration(track, duration)) {
        lastError = "only a 30-second preview is available";
        continue;
      }
      if (info._has_drm || info.has_drm) {
        lastError = "the source is DRM-protected";
        continue;
      }
      const format = pickBestAudioFormat(info);
      if (!format) {
        lastError = "no downloadable audio format";
        continue;
      }
      attempt.resolved = true;
      return { candidate, score, format };
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
    }
  }
  attempt.error = lastError;
  return null;
}

/**
 * Searches every supported source and resolves the most likely candidate from
 * each into a playable/downloadable full-length audio stream.
 */
export async function findAudioSources(
  track: SpotifyTrack,
  options: FindAudioSourcesOptions = {},
): Promise<AudioSourceResult> {
  const limit = Math.max(1, Math.floor(options.limit || 6));
  const minScore = options.minScore ?? 60;
  const maxPerSource = Math.max(1, Math.floor(options.maxPerSource || 2));
  const searches = options.searches || defaultSearches();
  const resolve = options.resolve || ((url: string) => getYtdlpStreams(url));

  const results = await Promise.allSettled(
    searches.map(({ search }) => search(track, limit)),
  );

  const attempts: SourceAttempt[] = searches.map(({ source }, index) => {
    const result = results[index];
    if (result.status === "rejected") {
      return {
        source,
        candidates: 0,
        resolved: false,
        error:
          result.reason instanceof Error
            ? result.reason.message
            : String(result.reason),
      };
    }
    return { source, candidates: result.value.length, resolved: false };
  });

  const allCandidates = results.flatMap((result) =>
    result.status === "fulfilled" ? result.value : [],
  );
  const groups = rankCandidates(track, allCandidates, minScore, maxPerSource);

  const resolved = await Promise.all(
    groups.map((group) => {
      const attempt = attempts.find(
        (item) => item.source === group[0].candidate.source,
      );
      if (!attempt) return Promise.resolve(null);
      return resolveGroup(track, group, attempt, resolve);
    }),
  );

  return {
    resolved: resolved
      .filter((item): item is ResolvedSource => item != null)
      .sort((a, b) => b.score - a.score),
    attempts,
  };
}
