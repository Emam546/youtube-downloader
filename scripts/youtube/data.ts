import { ResponseData, Media, ReturnedSearch } from "../types/types";
import { getTime } from "../utils";
import { validateID } from "./utils";
import { PATH } from "./valid";
import { YtdlpData } from "./download";
import { getYtdlpVideoData } from "../ytdlp/data";

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

  const YtdpData = await getYtdlpVideoData(
    `https://www.youtube.com/watch?v=${id}`
  );
  if (!YtdpData) return null;
  const YtdpFormats = YtdpData.formats;

  const videos: Media<YtdlpData>[] = [
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
          title: YtdpData.title,
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
  const duration = YtdpData.duration as number;
  const audios: Media<YtdlpData>[] = [
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
          title: `${YtdpData.title} - audioOnly`,
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
          title: `${YtdpData.title} - videoOnly`,
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
      thumbnail: YtdpData.thumbnails!.reduce(
        (cur, acc) => (cur.height > acc.height ? cur : acc),
        YtdpData.thumbnails![0]
      ).url,
      medias: {
        VIDEO: videos,
        AUDIO: audios,
        OTHERS: others,
      },
      viewerUrl: `https://www.youtube.com/watch?v=${id}`,
      title: YtdpData.title,
      duration,
    },
  };
}
