import {
  ResponseData,
  Media,
  RelatedData,
  ReturnedSearch,
} from "../types/types";
import { getTime } from "../utils";
import { validateID } from "./utils";
import { getInfo, videoFormat, videoInfo } from "@distube/ytdl-core";
import { PATH } from "./valid";
declare module "@distube/ytdl-core" {
  interface videoFormat {
    loudnessDb?: number;
  }
}
function AudioLoudnessType(a: number, b: number): "High" | "Low" | "Same" {
  const diff = Math.abs(Math.round(a)) - Math.abs(Math.round(b));
  if (diff == 0) return "Same";
  if (a < b) return "Low";
  return "High";
}
export async function getVideoData(
  query: Record<string, any>
): Promise<ResponseData | null> {
  const {
    id,
    start: startQ,
    end: endQ,
  } = query as {
    id: string;
    start?: string;
    end?: string;
  };
  if (id == undefined || !validateID(id)) return null;
  const data = await getInfo(id, { requestOptions: {} });
  const duration = parseInt(data.videoDetails.lengthSeconds);

  data.formats = data.formats.reduce((acc, v) => {
    const state = !acc.some(
      (g) =>
        g.codecs == v.codecs &&
        g.quality == v.quality &&
        g.container == v.container &&
        g.loudnessDb == v.loudnessDb
    );
    if (state) acc.push(v);
    return acc;
  }, [] as videoFormat[]);
  const audioMerge =
    data.formats.reduce((acc, cur) => {
      if (!(cur.hasAudio && !cur.hasVideo)) return acc;
      if (cur.container.toLowerCase() != "mp4") return acc;
      if (!acc) return cur;
      if (parseInt(acc.contentLength) > parseInt(cur.contentLength)) return acc;
      if (cur.loudnessDb! < acc.loudnessDb!) return acc;
      return cur;
    }, null as null | videoFormat) ||
    data.formats.reduce((acc, cur) => {
      if (!(cur.hasAudio && !cur.hasVideo)) return acc;
      if (!acc) return cur;
      if (cur.loudnessDb! < acc.loudnessDb!) return acc;
      return cur;
    }, null as null | videoFormat);

  const videos: Media[] = [
    ...data.formats
      .filter((v) => v.hasVideo && !v.hasAudio && audioMerge != undefined)
      .reduce((acc, v) => {
        if (
          v.container.toLowerCase() != "mp4" ||
          acc.some((g) => v.qualityLabel == g.qualityLabel)
        )
          return acc;
        return [...acc, v];
      }, [] as videoFormat[])
      .map((video, i) => {
        return {
          dlink: {
            video: video.url,
            audio: audioMerge?.url,
          },
          previewLink: `https://www.youtube.com/watch?v=${data.vid}`,
          container: video.container,
          size: parseInt(video.contentLength),
          text: {
            str: `${video.qualityLabel} (.${video.container})`,
          },
          quality: parseInt(video.qualityLabel),
          id: `${id}_video_${i}`,
        } as Media;
      }),
    ...data.formats
      .filter((v) => v.hasVideo && v.hasAudio)
      .map((video, i) => {
        return {
          dlink: video.url,
          previewLink: `https://www.youtube.com/watch?v=${data.vid}`,
          container: video.container,
          size: parseInt(video.contentLength),
          text: {
            str: `${video.qualityLabel} (.${video.container})`,
            label: {
              color: "blue",
              str: "original",
            },
          },
          quality: parseInt(video.qualityLabel),
          id: `${id}_videoOrg_${i}`,
        } as Media;
      }),
  ].sort((a, b) => {
    return b.quality - a.quality;
  });
  const loudness = data.player_response.playerConfig.audioConfig.loudnessDb;
  const audios: Media[] = data.formats
    .filter((v) => v.hasAudio && !v.hasVideo)
    .map((audio, i) => {
      const loudnessType = AudioLoudnessType(audio.loudnessDb!, loudness);
      return {
        dlink: audio.url,
        size: parseInt(audio.contentLength),
        previewLink: `https://www.youtube.com/watch?v=${data.vid}`,

        text: {
          str: `${audio.container.toUpperCase()} - (${audio.audioCodec?.toUpperCase()}) ${
            audio.audioBitrate
          }kbps`,
          label:
            loudnessType != "Same"
              ? {
                  color: "blue",
                  str:
                    (loudnessType == "Low" && "Quiet") ||
                    (loudnessType == "High" && "Loud"),
                }
              : undefined,
        },
        container: audio.container,
        quality: parseInt(audio.quality),
        id: `${id}_audio_${i}`,
      } as Media;
    });
  const others: Media[] = data.formats
    .filter((v) => v.hasVideo && !v.hasAudio)
    .map((video, i) => {
      return {
        dlink: video.url,
        previewLink: `https://www.youtube.com/watch?v=${data.vid}`,
        container: video.container,
        size: parseInt(video.contentLength),
        quality: parseInt(video.quality),
        id: `${id}_other_${i}`,
        text: {
          str: `Video Only ${
            video.qualityLabel
          } (${video.videoCodec?.toUpperCase()}) (.${video.container})`,
        },
      } as Media;
    });
  return {
    video: {
      start: getTime(startQ, 0, duration),
      end: getTime(endQ, duration, duration),
      thumbnail: data.videoDetails.thumbnails.reduce(
        (cur, acc) => (cur.height > acc.height ? cur : acc),
        data.videoDetails.thumbnails[0]
      ).url,
      medias: {
        VIDEO: videos,
        AUDIO: audios,
        OTHERS: others,
      },
      viewerUrl: `https://www.youtube.com/watch?v=${id}`,
      title: data.videoDetails.title,
      duration,
    },
    relatedData: [
      {
        id: "Related Videos",
        title: "RelatedVideos",
        data: data.related_videos.map<ReturnedSearch>((v) => {
          return {
            id: v.id!,
            link: `/${PATH}/${id}`,
            thumbnail: v.thumbnails.sort((a, b) => a.height - b.height).at(-1)!
              .url,
            title: [v.title!],
            duration: v.length_seconds!,
          };
        }),
      },
    ],
  };
}
