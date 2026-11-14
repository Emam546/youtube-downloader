import { getData } from "../data";
import { fetchSpotifyPage, SpotifyTrack } from "../metadata";
import { findAudioSources, ResolvedSource } from "../sources";

jest.mock("../metadata", () => ({
  fetchSpotifyPage: jest.fn(),
}));

jest.mock("../sources", () => ({
  ...jest.requireActual("../sources"),
  findAudioSources: jest.fn(),
}));

const mockedFetch = fetchSpotifyPage as jest.MockedFunction<
  typeof fetchSpotifyPage
>;
const mockedSources = findAudioSources as jest.MockedFunction<
  typeof findAudioSources
>;

const track: SpotifyTrack = {
  id: "trackid",
  title: "Never Gonna Give You Up",
  artists: "Rick Astley",
  durationMs: 213573,
};

function resolvedSource(): ResolvedSource {
  return {
    candidate: {
      source: "Bandcamp",
      title: "Rick Astley - Never Gonna Give You Up",
      artist: "Rick Astley",
      url: "https://example.bandcamp.com/track/never-gonna-give-you-up",
    },
    score: 90,
    format: {
      link: "",
      format_id: "mp3-128",
      url: "https://cdn.example/stream.mp3",
      ext: "mp3",
      type: "mp3",
      acodec: "mp3",
      abr: 128,
      filesize_approx: 3200000,
      has_audio: true,
      has_video: false,
      args: { format: "mp3-128" },
    } as ResolvedSource["format"],
  };
}

afterEach(() => {
  mockedFetch.mockReset();
  mockedSources.mockReset();
});

test("builds full-length audio choices from matching sources", async () => {
  mockedFetch.mockResolvedValue({
    kind: "track",
    id: track.id,
    name: track.title,
    tracks: [track],
  });
  mockedSources.mockResolvedValue({
    resolved: [resolvedSource()],
    attempts: [
      { source: "Bandcamp", candidates: 1, resolved: true },
      { source: "SoundCloud", candidates: 0, resolved: false },
      { source: "Audius", candidates: 0, resolved: false },
    ],
  });

  const data = await getData({ id: track.id, kind: "track" });
  const media = data?.video.medias.AUDIO?.[0];

  expect(media?.container).toBe("mp3");
  expect(media?.size).toBe(3200000);
  expect(media?.text.label).toEqual({ color: "green", str: "Bandcamp" });
  expect(media?.text.str).toBe("Bandcamp - MP3 (128kbps)");
  expect(media?.previewLink).toBe(
    "https://example.bandcamp.com/track/never-gonna-give-you-up",
  );
  expect(media?.data.data.ytdlpData?.link).toBe(
    "https://example.bandcamp.com/track/never-gonna-give-you-up",
  );
  expect(media?.data.data.ytdlpData?.args).toEqual({ format: "mp3-128" });
  expect(data?.video.viewerUrl).toBe("https://cdn.example/stream.mp3");
  expect(data?.video.duration).toBe(214);
});

test("does not require a Spotify preview URL", async () => {
  mockedFetch.mockResolvedValue({
    kind: "track",
    id: track.id,
    name: track.title,
    tracks: [{ ...track, previewUrl: undefined }],
  });
  mockedSources.mockResolvedValue({
    resolved: [resolvedSource()],
    attempts: [
      { source: "Bandcamp", candidates: 1, resolved: true },
      { source: "SoundCloud", candidates: 0, resolved: false },
      { source: "Audius", candidates: 0, resolved: false },
    ],
  });

  await expect(
    getData({ id: track.id, kind: "track" }),
  ).resolves.not.toBeNull();
});

test("reports every attempted source when nothing matches", async () => {
  mockedFetch.mockResolvedValue({
    kind: "track",
    id: track.id,
    name: track.title,
    tracks: [track],
  });
  mockedSources.mockResolvedValue({
    resolved: [],
    attempts: [
      {
        source: "Bandcamp",
        candidates: 0,
        resolved: false,
        error: "timed out",
      },
      { source: "SoundCloud", candidates: 0, resolved: false },
      { source: "Audius", candidates: 0, resolved: false },
    ],
  });

  await expect(getData({ id: track.id, kind: "track" })).rejects.toThrow(
    /No full-length audio source found.*Bandcamp \(timed out\), SoundCloud, Audius.*DRM-protected/,
  );
});
