import { ResponseData, Media, ReturnedSearch } from "../types/types";
import { getTime } from "../utils";
import { validateID } from "./utils";
import { videoFormat } from "@distube/ytdl-core";
import { getInfo } from "@distube/ytdl-core";
import { PATH } from "./valid";
import axios from "axios";
import { YtdlpData, YtdlpBase, getAllFormats } from "./download";

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
const asyncFilter = async <T>(
  arr: T[],
  predicate: Parameters<Array<T>["filter"]>[0]
): Promise<T[]> => {
  const results = await Promise.all(arr.map(predicate));

  return arr.filter((_v, index) => results[index]);
};

export async function getVideoData(
  query: Record<string, any>
): Promise<ResponseData<YtdlpData> | null> {
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
  const basicData = await getInfo(id);
  const duration = parseInt(basicData.videoDetails.lengthSeconds);
  const formats = await asyncFilter(
    basicData.formats.reduce((acc, v) => {
      const state = !acc.some(
        (g) =>
          g.codecs == v.codecs &&
          g.quality == v.quality &&
          g.container == v.container &&
          g.loudnessDb == v.loudnessDb
      );
      if (state) acc.push(v);
      return acc;
    }, [] as videoFormat[]),
    async (cur) => {
      try {
        await axios.head(cur.url);
        return true;
      } catch (error) {
        return false;
      }
    }
  );
  const audioFormats = await asyncFilter(formats, async (cur) => {
    if (!(cur.hasAudio && !cur.hasVideo)) return false;
    if (cur.container.toLowerCase() != "mp4") return false;
    return true;
  });
  const audioMerge = audioFormats.reduce((acc, cur) => {
    if (!acc) return cur;
    if (acc.bitrate! > cur.bitrate!) return acc;
    if (acc.loudnessDb! > cur.loudnessDb!) return acc;
    return cur;
  }, null as null | videoFormat);
  const YtdpFormats = await getAllFormats(
    `https://www.youtube.com/watch?v=${id}`
  );
  const videos: Media<YtdlpData>[] = [
    ...(await Promise.all(
      formats
        .filter((v) => v.hasVideo && !v.hasAudio && audioMerge != undefined)
        .reduce((acc, v) => {
          if (
            v.container.toLowerCase() != "mp4" ||
            acc.some((g) => v.qualityLabel == g.qualityLabel)
          )
            return acc;
          return [...acc, v];
        }, [] as videoFormat[])
        .map(async (video, i) => {
          return {
            environment: ["desktop", "web"],
            previewLink: `https://www.youtube.com/watch?v=${id}`,
            container: video.container,
            size:
              (await YtdlpBase.getEstimatedFileSize({
                mergeData: {
                  videoLink: video.url,
                  audioLink: audioMerge!.url,
                },
              })) || undefined,
            text: {
              str: `${video.qualityLabel} (.${video.container})`,
            },
            quality: parseInt(video.qualityLabel),
            id: `${id}_video_${i}`,
            data: {
              data: {
                mergeData: {
                  videoLink: video.url,
                  audioLink: audioMerge!.url,
                },
              },
              fquality: `${parseInt(video.qualityLabel)}`,
              ftype: video.container,
              PATH: PATH,
              previewLink: `https://www.youtube.com/watch?v=${id}`,
              title: basicData.videoDetails.title,
            },
          } as Media<YtdlpData>;
        })
    )),
    ...formats
      .filter((v) => v.hasVideo && v.hasAudio)
      .map((video, i) => {
        return {
          previewLink: `https://www.youtube.com/watch?v=${id}`,
          container: video.container,
          size: parseInt(video.contentLength),
          environment: ["web", "desktop"],
          data: {
            data: { link: video.url },
            fquality: `${parseInt(video.qualityLabel)}`,
            ftype: video.container,
            PATH: PATH,
            previewLink: `https://www.youtube.com/watch?v=${id}`,
            title: basicData.videoDetails.title,
          },
          text: {
            str: `${video.qualityLabel} (.${video.container})`,
            label: {
              color: "blue",
              str: "original",
            },
          },
          quality: parseInt(video.qualityLabel),
          id: `${id}_videoMerged_${i}`,
        } as Media<YtdlpData>;
      }),
    ...YtdpFormats.filter(
      (quality) => quality.has_video && quality.has_audio
    ).map((quality) => {
      return {
        size: quality.filesize || quality.filesize_approx,
        previewLink: `https://www.youtube.com/watch?v=${id}`,
        container: "mp4",
        environment: ["desktop", "web"],
        data: {
          data: {
            ytdlpData: {
              link: `https://www.youtube.com/watch?v=${id}`,
              ...quality,
            },
          },
          fquality: quality.qualityLabel,
          ftype: quality.ext,
          PATH: PATH,
          previewLink: `https://www.youtube.com/watch?v=${id}`,
          title: basicData.videoDetails.title,
        },
        text: {
          str: `${quality.qualityLabel} (.${quality.ext})`,
        },
        quality: parseInt(quality.qualityLabel!),
        id: `${id}_videoytdlp_${quality.qualityLabel}`,
      } as Media<YtdlpData>;
    }),
  ].sort((a, b) => {
    return b.quality - a.quality;
  });

  const loudness =
    basicData.player_response.playerConfig.audioConfig.loudnessDb;
  const audios: Media<YtdlpData>[] = [
    ...audioFormats
      .filter((v) => v.hasAudio && !v.hasVideo)
      .map((audio, i) => {
        const loudnessType = AudioLoudnessType(audio.loudnessDb!, loudness);
        return {
          size: parseInt(audio.contentLength),
          previewLink: `https://www.youtube.com/watch?v=${id}`,
          data: {
            data: { link: audio.url },
            fquality: `${parseInt(audio.quality)}`,
            ftype: audio.container,
            PATH: PATH,
            previewLink: `https://www.youtube.com/watch?v=${id}`,
            title: basicData.videoDetails.title,
          },
          environment: ["desktop", "web"],
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
        } as Media<YtdlpData>;
      }),
    ...YtdpFormats.filter((v) => !v.has_video && v.has_audio).map((audio) => {
      return {
        previewLink: `https://www.youtube.com/watch?v=${id}`,
        container: "mp4",
        environment: ["desktop", "web"],
        data: {
          data: {
            ytdlpData: {
              link: `https://www.youtube.com/watch?v=${id}`,
              ...audio,
            },
          },
          fquality: audio.quality?.toString(),
          ftype: audio.ext!,
          PATH: PATH,
          previewLink: `https://www.youtube.com/watch?v=${id}`,
          title: `${basicData.videoDetails.title} - audioOnly`,
        },
        text: {
          str: `${audio.ext?.toUpperCase()} - (${audio.acodec?.toUpperCase()}) ${
            audio.abr
          }kbps`,
        },
        quality: audio.quality,
        id: `${id}_videoytdlp_${audio.quality}`,
      } as Media<YtdlpData>;
    }),
  ];
  const others: Media<YtdlpData>[] = [
    ...formats
      .filter((v) => v.hasVideo && !v.hasAudio)
      .map((video, i) => {
        return {
          container: video.container,
          size: parseInt(video.contentLength),
          quality: parseInt(video.qualityLabel),
          previewLink: `https://www.youtube.com/watch?v=${id}`,
          environment: ["desktop", "web"],
          id: `${id}_otherOrg_${i}`,
          data: {
            data: { link: video.url },
            fquality: `${parseInt(video.qualityLabel)}p`,
            ftype: video.container,
            PATH: PATH,
            previewLink: `https://www.youtube.com/watch?v=${id}`,
            title: `${basicData.videoDetails.title} - videoOnly`,
          },
          text: {
            str: `Video Only ${
              video.qualityLabel
            } (${video.videoCodec?.toUpperCase()}) (.${video.container})`,
          },
        } as Media<YtdlpData>;
      }),
    ...YtdpFormats.filter((v) => v.has_video && !v.has_audio).map((video) => {
      return {
        previewLink: `https://www.youtube.com/watch?v=${id}`,
        container: "mp4",
        environment: ["desktop", "web"],
        data: {
          data: {
            ytdlpData: {
              link: `https://www.youtube.com/watch?v=${id}`,
              ...video,
            },
          },
          fquality: video.qualityLabel,
          ftype: video.ext!,
          PATH: PATH,
          previewLink: `https://www.youtube.com/watch?v=${id}`,
          title: `${basicData.videoDetails.title} - videoOnly`,
        },
        text: {
          str: `Video Only ${
            video.qualityLabel
          } (${video.vcodec?.toUpperCase()}) (.${video.ext})`,
        },
        quality: parseInt(video.qualityLabel!),
        id: `${id}_videoytdlp_${video.qualityLabel}`,
      } as Media<YtdlpData>;
    }),
  ].sort((a, b) => {
    return b.quality - a.quality;
  });
  return {
    video: {
      start: getTime(startQ, 0, duration),
      end: getTime(endQ, duration, duration),
      thumbnail: basicData.videoDetails.thumbnails.reduce(
        (cur, acc) => (cur.height > acc.height ? cur : acc),
        basicData.videoDetails.thumbnails[0]
      ).url,
      medias: {
        VIDEO: videos,
        AUDIO: audios,
        OTHERS: others,
      },
      viewerUrl: `https://www.youtube.com/watch?v=${id}`,
      title: basicData.videoDetails.title,
      duration,
    },
    relatedData: [
      {
        id: "Related Videos",
        title: "RelatedVideos",
        data: basicData.related_videos.map<ReturnedSearch>((v) => {
          return {
            id: v.id!,
            link: `/${PATH}/${v.id}`,
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
