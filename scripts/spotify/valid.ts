import { NavigateData } from "../types/types";

export const PATH = "spotify";

export const SPOTIFY_KINDS = [
  "track",
  "album",
  "playlist",
  "episode",
  "artist",
] as const;

export type SpotifyKind = (typeof SPOTIFY_KINDS)[number];

export interface SpotifyRef {
  kind: SpotifyKind;
  id: string;
}

const SHORT_HOSTS = new Set([
  "spotify.link",
  "spoti.fi",
  "spotify.app.link",
]);

function isKind(value: string): value is SpotifyKind {
  return (SPOTIFY_KINDS as readonly string[]).includes(value);
}

export function parseSpotifyUrl(input: string): SpotifyRef | null {
  const trimmed = input.trim();
  const uri = trimmed.match(
    /^spotify:(track|album|playlist|episode|artist):([A-Za-z0-9]+)$/i,
  );
  if (uri && isKind(uri[1].toLowerCase())) {
    return { kind: uri[1].toLowerCase() as SpotifyKind, id: uri[2] };
  }

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return null;
  }

  const host = url.hostname.replace(/^www\./, "").toLowerCase();
  if (host !== "open.spotify.com" && host !== "play.spotify.com") return null;

  const parts = url.pathname.split("/").filter(Boolean);
  const kindIndex = parts.findIndex((part) => isKind(part.toLowerCase()));
  const id = kindIndex >= 0 ? parts[kindIndex + 1] : "";
  if (!id || !/^[A-Za-z0-9]+$/.test(id) || !isKind(parts[kindIndex].toLowerCase())) {
    return null;
  }
  return { kind: parts[kindIndex].toLowerCase() as SpotifyKind, id };
}

function isShortLink(input: string) {
  try {
    const host = new URL(input).hostname.replace(/^www\./, "").toLowerCase();
    return SHORT_HOSTS.has(host);
  } catch {
    return false;
  }
}

async function resolveShortLink(input: string): Promise<string> {
  const axios = (await import("axios")).default;
  const response = await axios.get(input, {
    maxRedirects: 5,
    timeout: 15000,
    validateStatus: () => true,
  });
  const finalUrl = response.request?.res?.responseUrl as string | undefined;
  return finalUrl || input;
}

export async function navigate(str: string): Promise<NavigateData | null> {
  let ref = parseSpotifyUrl(str);
  if (!ref && isShortLink(str)) {
    try {
      ref = parseSpotifyUrl(await resolveShortLink(str));
    } catch {
      return null;
    }
  }
  if (!ref) return null;
  const search = new URLSearchParams({ kind: ref.kind });
  return {
    path: PATH,
    id: ref.id,
    navigate: `/${PATH}/${ref.id}?${search.toString()}`,
    queries: { kind: ref.kind },
  };
}

export function predictInputString(query: Record<string, unknown>): string {
  const id = typeof query.id === "string" ? query.id : "";
  const kind =
    typeof query.kind === "string" && isKind(query.kind) ? query.kind : "track";
  return `https://open.spotify.com/${kind}/${id}`;
}
