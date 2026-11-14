import { ResponseData, Media } from "../types/types";
import { YtdlpData } from "../utils/Bases/ytdlp";
import { fetchSpotifyPage, SpotifyPage, SpotifyTrack } from "./metadata";
import { findAudioSources, mediaForSource } from "./sources";
import { PATH, SpotifyKind, SPOTIFY_KINDS } from "./valid";

function isKind(value: string): value is SpotifyKind {
  return (SPOTIFY_KINDS as readonly string[]).includes(value);
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

function shortError(error?: string) {
  if (!error) return "";
  const clean = error.replace(/\s+/g, " ").trim();
  return clean.length > 140 ? `${clean.slice(0, 137)}...` : clean;
}

function noSourceError(
  track: SpotifyTrack,
  attempts: { source: string; error?: string }[],
) {
  const displayTitle = track.artists
    ? `${track.artists} - ${track.title}`
    : track.title;
  const tried = attempts
    .map((attempt) => {
      const error = shortError(attempt.error);
      return error ? `${attempt.source} (${error})` : attempt.source;
    })
    .join(", ");
  return new Error(
    `No full-length audio source found for "${displayTitle}" on ${tried}. ` +
      "Spotify streams are DRM-protected and only its 30-second preview is public. " +
      "This resolver looks for a downloadable copy on Bandcamp, SoundCloud, and Audius.",
  );
}

export async function getData(
  query: Record<string, unknown>,
): Promise<ResponseData<YtdlpData> | null> {
  const id = typeof query.id === "string" ? query.id : "";
  const requested = typeof query.kind === "string" ? query.kind : "track";
  if (!id || !isKind(requested)) return null;

  const page = await fetchSpotifyPage(requested, id);
  const requestedTrack = typeof query.track === "string" ? query.track : "";
  const track = requestedTrack
    ? page.tracks.find((item) => item.id === requestedTrack) || page.tracks[0]
    : page.tracks[0];
  if (!track) return null;

  const displayTitle = track.artists
    ? `${track.artists} - ${track.title}`
    : track.title;

  const { resolved, attempts } = await findAudioSources(track);
  if (!resolved.length) throw noSourceError(track, attempts);

  const medias: Media<YtdlpData>[] = resolved.map((source) =>
    mediaForSource(track, source),
  );
  const duration = track.durationMs
    ? Math.round(track.durationMs / 1000)
    : undefined;

  return {
    video: {
      title: displayTitle,
      thumbnail: track.thumbnail || page.thumbnail,
      duration,
      start: 0,
      end: duration,
      viewerUrl: resolved[0].format.url || resolved[0].candidate.url,
      medias: {
        AUDIO: medias,
      },
    },
    relatedData: related(page),
  };
}
