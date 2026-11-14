import { v4 } from "uuid";
import { Media, ResponseData } from "../types/types";
import { FormatResult } from "../utils/Bases/ytdlp";
import { YtdlpData } from "../utils/Bases/ytdlp";
import { getYtdlpStreams } from "../utils/func";
import { fetchSpotifyPage, SpotifyPage, SpotifyTrack } from "./metadata";
import { findYoutubeMatch } from "./match";
import { PATH, SpotifyKind, SPOTIFY_KINDS } from "./valid";

function isKind(value: string): value is SpotifyKind {
  return (SPOTIFY_KINDS as readonly string[]).includes(value);
}

function audioFormats(formats: FormatResult[]) {
  return formats
    .filter((format) => format.has_audio && !format.has_video)
    .sort((a, b) => (b.abr || b.tbr || 0) - (a.abr || a.tbr || 0));
}

function media(options: {
  link: string;
  title: string;
  text: string;
  container: string;
  quality: number;
  id: string;
  size?: number | null;
  ytdlp: FormatResult & { link: string };
  label?: string;
}): Media<YtdlpData> {
  return {
    previewLink: options.link,
    container: options.container,
    environment: ["desktop", "web"],
    size: options.size || undefined,
    data: {
      data: { ytdlpData: options.ytdlp },
      fquality: String(options.quality),
      ftype: options.container,
      PATH,
      previewLink: options.link,
      title: options.title,
    },
    text: {
      str: options.text,
      label: options.label ? { color: "green", str: options.label } : undefined,
    },
    quality: options.quality,
    id: options.id,
  };
}

async function audioChoices(
  track: SpotifyTrack,
  link: string,
  title: string,
): Promise<Media<YtdlpData>[]> {
  let formats: FormatResult[] = [];
  try {
    const info = await getYtdlpStreams(link);
    formats = (info.formats || []).map((format) => {
      return {
        ...format,
        has_video: format.height != undefined || format.vcodec != "none",
        has_audio: format.acodec != "none",
        type: format.ext,
        args: { format: format.format_id },
      } as FormatResult;
    });
  } catch {
    formats = [];
  }

  const specific = audioFormats(formats).map((format) => {
    const codec = format.acodec ? format.acodec.toUpperCase() : "AUDIO";
    const bitrate = format.abr || format.tbr;
    return media({
      link,
      title,
      container: format.ext || "m4a",
      quality: Math.round(bitrate || 0),
      id: `${track.id}_${format.format_id}_${v4()}`,
      size: format.filesize || format.filesize_approx,
      text: `${(format.ext || "audio").toUpperCase()} - (${codec})${
        bitrate ? ` ${Math.round(bitrate)}kbps` : ""
      }`,
      ytdlp: { ...format, link },
    });
  });

  const best = media({
    link,
    title,
    container: "m4a",
    quality: (specific[0]?.quality || 0) + 1,
    id: `${track.id}_bestaudio`,
    text: "Best audio",
    label: "YouTube",
    ytdlp: {
      link,
      ext: "m4a",
      type: "m4a",
      has_audio: true,
      has_video: false,
      args: { format: "bestaudio/best" },
    } as FormatResult & { link: string },
  });
  return [best, ...specific];
}

function related(page: SpotifyPage) {
  if (page.tracks.length < 2) return undefined;
  const single = page.kind === "track" || page.kind === "episode";
  return [
    {
      id: page.id,
      title: page.name,
      data: page.tracks.map((track) => {
        const search = new URLSearchParams(
          single ? { kind: "track" } : { kind: page.kind, track: track.id },
        );
        const target = single ? track.id : page.id;
        return {
          id: track.id,
          link: `/${PATH}/${target}?${search.toString()}`,
          thumbnail: track.thumbnail || page.thumbnail || "",
          title: [
            track.artists ? `${track.title} — ${track.artists}` : track.title,
          ],
          duration: track.durationMs
            ? Math.round(track.durationMs / 1000)
            : undefined,
        };
      }),
    },
  ];
}

export async function getData(
  query: Record<string, unknown>,
): Promise<ResponseData<YtdlpData> | null> {
  const id = typeof query.id === "string" ? query.id : "";
  const requested = typeof query.kind === "string" ? query.kind : "track";
  if (!id || !isKind(requested)) return null;

  const page = await fetchSpotifyPage(requested, id);
  const requestedTrack = typeof query.track === "string" ? query.track : "";
  const track =
    page.tracks.find((item) => item.id === requestedTrack) || page.tracks[0];
  if (!track) return null;

  const match = await findYoutubeMatch(track);
  const displayTitle = track.artists
    ? `${track.artists} - ${track.title}`
    : track.title;
  if (!match) {
    throw new Error(`No YouTube audio match for ${displayTitle}`);
  }

  const duration = track.durationMs
    ? Math.round(track.durationMs / 1000)
    : match.duration;
  return {
    video: {
      title: displayTitle,
      thumbnail: track.thumbnail || page.thumbnail,
      duration,
      start: 0,
      end: duration,
      viewerUrl: `https://open.spotify.com/${
        page.kind === "episode" ? "episode" : "track"
      }/${track.id}`,
      medias: {
        AUDIO: await audioChoices(track, match.url, displayTitle),
      },
    },
    relatedData: related(page),
  };
}
