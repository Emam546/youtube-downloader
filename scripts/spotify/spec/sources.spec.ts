import { SpotifyTrack } from "../metadata";
import {
  candidateFromAudius,
  candidateFromBandcamp,
  candidateFromSoundcloud,
  findAudioSources,
  mediaForSource,
  pickBestAudioFormat,
  rankCandidates,
  scoreCandidate,
  SourceCandidate,
} from "../sources";

const track: SpotifyTrack = {
  id: "trackid",
  title: "Never Gonna Give You Up",
  artists: "Rick Astley",
  durationMs: 213573,
};

test("normalizes SoundCloud, Bandcamp, and Audius results", () => {
  expect(
    candidateFromSoundcloud({
      title: "Never Gonna Give You Up",
      uploader: "Rick Astley",
      webpage_url: "https://soundcloud.com/rick-astley/never-gonna-give-you-up",
      duration: 213,
      thumbnails: [
        { url: "https://img/small.jpg", width: 100 },
        { url: "https://img/large.jpg", width: 500 },
      ],
    }),
  ).toEqual({
    source: "SoundCloud",
    title: "Never Gonna Give You Up",
    artist: "Rick Astley",
    url: "https://soundcloud.com/rick-astley/never-gonna-give-you-up",
    duration: 213,
    thumbnail: "https://img/large.jpg",
  });

  expect(
    candidateFromBandcamp({
      name: "Rick Astley - Never Gonna Give You Up",
      band_name: "Rick Astley",
      item_url_path:
        "https://rickastley.bandcamp.com/track/never-gonna-give-you-up",
      img: "https://f4.bcbits.com/img/123_3.jpg",
    }),
  ).toEqual({
    source: "Bandcamp",
    title: "Rick Astley - Never Gonna Give You Up",
    artist: "Rick Astley",
    url: "https://rickastley.bandcamp.com/track/never-gonna-give-you-up",
    thumbnail: "https://f4.bcbits.com/img/123_10.jpg",
  });

  expect(
    candidateFromAudius({
      title: "Never Gonna Give You Up",
      permalink: "/rickastley/never-gonna-give-you-up",
      duration: 213,
      is_streamable: true,
      user: { name: "Rick Astley" },
      artwork: { "480x480": "https://img/audius.jpg" },
    }),
  ).toEqual({
    source: "Audius",
    title: "Never Gonna Give You Up",
    artist: "Rick Astley",
    url: "https://audius.co/rickastley/never-gonna-give-you-up",
    duration: 213,
    thumbnail: "https://img/audius.jpg",
  });

  expect(
    candidateFromAudius({ title: "Blocked", permalink: "/x/y", is_available: false }),
  ).toBeNull();
});

test("rejects 30-second previews and penalizes alternate versions", () => {
  const official = scoreCandidate(track, {
    source: "SoundCloud",
    title: "Rick Astley - Never Gonna Give You Up",
    artist: "Rick Astley",
    url: "https://soundcloud.com/official",
    duration: 213,
  });
  const preview = scoreCandidate(track, {
    source: "SoundCloud",
    title: "Never Gonna Give You Up",
    artist: "Rick Astley",
    url: "https://soundcloud.com/preview",
    duration: 30,
  });
  const remix = scoreCandidate(track, {
    source: "SoundCloud",
    title: "Never Gonna Give You Up (Remix)",
    artist: "Rick Astley",
    url: "https://soundcloud.com/remix",
    duration: 213,
  });

  expect(official).toBeGreaterThanOrEqual(30);
  expect(official).toBeGreaterThan(remix);
  expect(preview).toBe(0);
});

test("keeps the best candidates per source and drops previews", () => {
  const candidates: SourceCandidate[] = [
    {
      source: "Bandcamp",
      title: "Rick Astley - Never Gonna Give You Up (Remix)",
      artist: "Someone",
      url: "https://bandcamp.com/remix",
    },
    {
      source: "Bandcamp",
      title: "Rick Astley - Never Gonna Give You Up",
      artist: "Rick Astley",
      url: "https://bandcamp.com/original",
    },
    {
      source: "SoundCloud",
      title: "Never Gonna Give You Up",
      artist: "Rick Astley",
      url: "https://soundcloud.com/preview",
      duration: 30,
    },
    {
      source: "SoundCloud",
      title: "Rick Astley - Never Gonna Give You Up",
      artist: "Rick Astley",
      url: "https://soundcloud.com/full",
      duration: 213,
    },
  ];

  const groups = rankCandidates(track, candidates);
  expect(groups).toHaveLength(2);

  const bandcamp = groups.find(
    (group) => group[0].candidate.source === "Bandcamp",
  );
  const soundcloud = groups.find(
    (group) => group[0].candidate.source === "SoundCloud",
  );
  expect(bandcamp?.[0].candidate.url).toBe("https://bandcamp.com/original");
  expect(soundcloud?.map((item) => item.candidate.url)).toEqual([
    "https://soundcloud.com/full",
  ]);
});

test("picks the highest quality audio-only format", () => {
  const format = pickBestAudioFormat({
    formats: [
      {
        format_id: "mp3-128",
        url: "https://cdn/128.mp3",
        ext: "mp3",
        acodec: "mp3",
        vcodec: "none",
        abr: 128,
      },
      {
        format_id: "mp3-320",
        url: "https://cdn/320.mp3",
        ext: "mp3",
        acodec: "mp3",
        vcodec: "none",
        abr: 320,
        filesize: 5000000,
      },
      {
        format_id: "video",
        url: "https://cdn/video.mp4",
        ext: "mp4",
        acodec: "aac",
        vcodec: "h264",
        abr: 128,
      },
    ],
  });

  expect(format?.format_id).toBe("mp3-320");
  expect(format?.args).toEqual({ format: "mp3-320" });
  expect(format?.has_video).toBe(false);
});

test("accepts Audius single-stream payloads without a formats array", () => {
  const format = pickBestAudioFormat({
    format_id: "0",
    url: "https://api.audius.co/v1/tracks/abc/stream",
    ext: "mp3",
    acodec: "mp3",
    vcodec: null,
    duration: 213,
  });

  expect(format?.format_id).toBe("0");
  expect(format?.ext).toBe("mp3");
});

test("builds a downloadable media entry labeled by source", () => {
  const media = mediaForSource(track, {
    candidate: {
      source: "SoundCloud",
      title: "Rick Astley - Never Gonna Give You Up",
      artist: "Rick Astley",
      url: "https://soundcloud.com/rick-astley/never-gonna-give-you-up",
    },
    score: 90,
    format: {
      format_id: "hls_aac_96k",
      ext: "m4a",
      abr: 96,
      filesize_approx: 2500000,
      args: { format: "hls_aac_96k" },
    } as never,
  });

  expect(media.container).toBe("m4a");
  expect(media.size).toBe(2500000);
  expect(media.text.label).toEqual({ color: "green", str: "SoundCloud" });
  expect(media.text.str).toBe("SoundCloud - M4A (96kbps)");
  expect(media.data.ftype).toBe("m4a");
  expect(media.data.fquality).toBe("96kbps");
  expect(media.data.data.ytdlpData?.link).toBe(
    "https://soundcloud.com/rick-astley/never-gonna-give-you-up",
  );
});

test("resolves one candidate per source and records failures", async () => {
  const resolve = jest.fn(async (url: string) => {
    if (url.includes("bandcamp")) {
      return {
        duration: 213,
        formats: [
          {
            format_id: "mp3-128",
            url: "https://cdn/bandcamp.mp3",
            ext: "mp3",
            acodec: "mp3",
            vcodec: "none",
            abr: 128,
          },
        ],
      };
    }
    return { duration: 213, formats: [] };
  });

  const result = await findAudioSources(track, {
    searches: [
      {
        source: "Bandcamp",
        search: async () => [
          {
            source: "Bandcamp",
            title: "Rick Astley - Never Gonna Give You Up",
            artist: "Rick Astley",
            url: "https://bandcamp.com/track",
          },
        ],
      },
      {
        source: "SoundCloud",
        search: async () => {
          throw new Error("soundcloud offline");
        },
      },
      {
        source: "Audius",
        search: async () => [
          {
            source: "Audius",
            title: "Rick Astley - Never Gonna Give You Up",
            artist: "Rick Astley",
            url: "https://audius.co/track",
            duration: 213,
          },
        ],
      },
    ],
    resolve,
  });

  expect(result.resolved).toHaveLength(1);
  expect(result.resolved[0].candidate.source).toBe("Bandcamp");
  expect(result.resolved[0].format.link).toBe("");
  expect(resolve).toHaveBeenCalledTimes(2);

  const soundcloud = result.attempts.find(
    (attempt) => attempt.source === "SoundCloud",
  );
  const audius = result.attempts.find((attempt) => attempt.source === "Audius");
  expect(soundcloud?.error).toBe("soundcloud offline");
  expect(audius?.resolved).toBe(false);
  expect(audius?.error).toBe("no downloadable audio format");
});

test("does not resolve a source that only serves a preview", async () => {
  const result = await findAudioSources(track, {
    searches: [
      {
        source: "Bandcamp",
        search: async () => [
          {
            source: "Bandcamp",
            title: "Rick Astley - Never Gonna Give You Up",
            artist: "Rick Astley",
            url: "https://bandcamp.com/track",
          },
        ],
      },
    ],
    resolve: async () => ({
      duration: 30,
      formats: [],
    }),
  });

  expect(result.resolved).toHaveLength(0);
  expect(result.attempts[0].error).toBe("only a 30-second preview is available");
});
