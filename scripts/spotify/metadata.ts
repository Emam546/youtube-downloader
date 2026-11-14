import { SpotifyKind } from "./valid";

export interface SpotifyTrack {
  id: string;
  title: string;
  artists: string;
  durationMs: number;
  thumbnail?: string;
  releaseDate?: string;
  previewUrl?: string;
}

export interface SpotifyPage {
  kind: SpotifyKind;
  id: string;
  name: string;
  thumbnail?: string;
  subtitle?: string;
  releaseDate?: string;
  tracks: SpotifyTrack[];
}

interface EmbedImage {
  url?: string;
  maxWidth?: number;
  maxHeight?: number;
}

function idFromUri(uri: unknown): string | null {
  if (typeof uri !== "string") return null;
  const match = uri.match(/^spotify:(?:track|episode):([A-Za-z0-9]+)$/);
  return match ? match[1] : null;
}

function largestImage(visualIdentity: unknown): string | undefined {
  const images = (visualIdentity as { image?: EmbedImage[] } | undefined)?.image;
  if (!Array.isArray(images) || images.length == 0) return undefined;
  const sorted = [...images].sort(
    (a, b) => (b.maxWidth || b.maxHeight || 0) - (a.maxWidth || a.maxHeight || 0),
  );
  return sorted.find((image) => image.url)?.url;
}

function coverFrom(entity: Record<string, unknown>): string | undefined {
  const fromVisual = largestImage(entity.visualIdentity);
  if (fromVisual) return fromVisual;
  const coverArt = entity.coverArt as
    | { url?: string; sources?: { url?: string }[] }
    | { url?: string; sources?: { url?: string }[] }[]
    | undefined;
  if (Array.isArray(coverArt)) return coverArt.find((item) => item.url)?.url;
  return coverArt?.sources?.find((item) => item.url)?.url || coverArt?.url;
}

function artistsFrom(entity: Record<string, unknown>): string {
  const artists = entity.artists as { name?: string }[] | undefined;
  if (Array.isArray(artists) && artists.length) {
    return artists
      .map((artist) => artist.name)
      .filter((name): name is string => !!name)
      .join(", ");
  }
  return typeof entity.subtitle === "string" ? entity.subtitle : "";
}

function releaseDateFrom(entity: Record<string, unknown>): string | undefined {
  const value = entity.releaseDate as
    | string
    | { isoString?: string; year?: number }
    | null
    | undefined;
  if (typeof value === "string") return value || undefined;
  if (value && typeof value === "object") {
    if (value.isoString) return value.isoString.slice(0, 10);
    if (typeof value.year === "number") return String(value.year);
  }
  return undefined;
}

function previewFrom(entity: Record<string, unknown>): string | undefined {
  const preview = entity.audioPreview as { url?: string } | undefined;
  if (preview?.url) return preview.url;
  return typeof entity.preview_url === "string" ? entity.preview_url : undefined;
}

function trackFromEntity(
  entity: Record<string, unknown>,
  thumbnail?: string,
): SpotifyTrack | null {
  const id =
    (typeof entity.id === "string" && entity.id) || idFromUri(entity.uri);
  const title =
    (typeof entity.title === "string" && entity.title) ||
    (typeof entity.name === "string" && entity.name) ||
    "";
  if (!id || !title) return null;
  const releaseDate = releaseDateFrom(entity);
  const previewUrl = previewFrom(entity);
  return {
    id,
    title,
    artists: artistsFrom(entity),
    durationMs: typeof entity.duration === "number" ? entity.duration : 0,
    thumbnail: thumbnail || coverFrom(entity),
    ...(releaseDate ? { releaseDate } : {}),
    ...(previewUrl ? { previewUrl } : {}),
  };
}

export function parseEmbedHtml(html: string): SpotifyPage {
  const match = html.match(
    /<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/,
  );
  if (!match) throw new Error("Spotify embed page did not include track data");
  const json = JSON.parse(match[1]) as {
    props?: { pageProps?: { state?: { data?: { entity?: Record<string, unknown> } } } };
  };
  const entity = json.props?.pageProps?.state?.data?.entity;
  if (!entity || typeof entity.type !== "string") {
    throw new Error("Spotify embed page did not include an entity");
  }
  const kind = entity.type as SpotifyKind;
  const thumbnail = coverFrom(entity);
  const list = Array.isArray(entity.trackList)
    ? (entity.trackList as Record<string, unknown>[])
    : null;
  const tracks = list
    ? list
        .filter((item) => item.isPlayable !== false)
        .map((item) => trackFromEntity(item, thumbnail))
        .filter((item): item is SpotifyTrack => item != null)
    : [trackFromEntity(entity, thumbnail)].filter(
        (item): item is SpotifyTrack => item != null,
      );
  return {
    kind,
    id: typeof entity.id === "string" ? entity.id : "",
    name:
      (typeof entity.name === "string" && entity.name) ||
      (typeof entity.title === "string" && entity.title) ||
      tracks[0]?.title ||
      "Spotify",
    thumbnail,
    subtitle: typeof entity.subtitle === "string" ? entity.subtitle : undefined,
    releaseDate: releaseDateFrom(entity) || tracks[0]?.releaseDate,
    tracks,
  };
}

export async function fetchSpotifyPage(
  kind: SpotifyKind,
  id: string,
): Promise<SpotifyPage> {
  const axios = (await import("axios")).default;
  const response = await axios.get<string>(
    `https://open.spotify.com/embed/${kind}/${id}`,
    {
      timeout: 20000,
      responseType: "text",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        Accept: "text/html",
      },
    },
  );
  return parseEmbedHtml(response.data);
}
