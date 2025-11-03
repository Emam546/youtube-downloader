import { ResponseData, Media } from "../types/types";
import { getQualityFromResolution } from "../utils";

import { PATH } from "./valid";
import { FormatResult, ytdlp } from "../utils/Bases/ytdlp";
import { YtdlpData } from "./download";
import { getFrameScreenShot, getVideoInfo } from "../utils/ffmpeg";
import { v4 } from "uuid";
export interface YtDlpData {
  id: string;
  title: string;
  thumbnail?: string;
  duration?: number;
  duration_string?: string;
  view_count?: number | null;
  age_limit?: number | null;
  formats: FormatResult[];
  webpage_url: string;
  original_url: string;
  webpage_url_basename: string;
  webpage_url_domain: string;
  extractor: string;
  extractor_key: string;
  playlist: string | null;
  playlist_index: number | null;
  thumbnails?: Thumbnail[];
  display_id: string;
  fulltitle: string;
  release_year: number | null;
  requested_subtitles: unknown | null;
  _has_drm: boolean | null;
  epoch: number;
  format_id: string;
  format_index: number | null;
  url: string;
  manifest_url?: string;
  tbr?: number | null;
  ext: string;
  fps?: number | null;
  protocol: string;
  preference?: number | null;
  quality?: number | null;
  has_drm?: boolean | null;
  width?: number | null;
  height?: number | null;
  video_ext: string;
  audio_ext: string;
  vbr?: number | null;
  abr?: number | null;
  resolution?: string | null;
  dynamic_range: string;
  aspect_ratio?: number | null;
  http_headers: HttpHeaders;
  format: string;
  __working?: boolean;
  _filename: string;
  filename: string;
  _type: "video";
  _version: YtDlpVersion;
}

export interface HttpHeaders {
  "User-Agent": string;
  Accept: string;
  "Accept-Language": string;
  "Sec-Fetch-Mode": string;
}

export interface Thumbnail {
  url: string;
  id?: string;
}

export interface YtDlpVersion {
  version: string;
  current_git_head: string | null;
  release_git_head: string | null;
  repository: string;
}

async function getVideoData(url: string): Promise<YtDlpData> {
  const result = await ytdlp.execAsync(url, {
    dumpJson: true,
    checkAllFormats: true,
    skipDownload: true,
  });

  const data = JSON.parse(result) as YtDlpData;

  const formats = data.formats.map((data) => {
    return {
      ...data,
      has_video: data.height != undefined || data.vcodec != "none",
      has_audio: data.acodec != "none",
      qualityLabel:
        data.width != undefined
          ? (getQualityFromResolution(data.width, data.height!)
              .label as FormatResult["qualityLabel"])
          : undefined,
      type: data.ext!,
      args: {
        format: data.format_id,
      } as FormatResult,
    };
  });
  return { ...data, formats };
}
export async function getData(
  query: Record<string, any>
): Promise<ResponseData<YtdlpData> | null> {
  const { link } = query as {
    link: string;
  };

  const ytdlpData = await getVideoData(link);
  let thumbnail = ytdlpData.thumbnails;
  if (!thumbnail || !thumbnail.length) {
    try {
      const data = await getFrameScreenShot(ytdlpData.url);
      thumbnail = [
        {
          id: "ss",
          url: `data:image/jpeg;base64,${data}`,
        },
      ];
    } catch (error) {}
  }
  const metaData = await getVideoInfo(ytdlpData.url);

  const YtdpFormats = ytdlpData.formats;
  const videos: Media<YtdlpData>[] = [
    ...YtdpFormats.filter(
      (quality) => quality.has_video && quality.has_audio
    ).map((quality) => {
      return {
        size: quality.filesize || quality.filesize_approx,
        previewLink: ytdlpData.url,
        container: "mp4",
        environment: ["desktop"],
        data: {
          data: {
            ytdlpData: {
              link: link,
              ...quality,
            },
          },
          fquality: quality.qualityLabel || quality.format_id,
          ftype: quality.ext,
          PATH: PATH,
          previewLink: ytdlpData.url,
          title: ytdlpData.title,
        },
        text: {
          str: `${quality.qualityLabel || quality.format_id} (.${quality.ext})`,
        },
        quality: parseInt(quality.qualityLabel!),
        id: `videoytdlp_${quality.qualityLabel}${v4()}`,
      } as Media<YtdlpData>;
    }),
  ].sort((a, b) => {
    return b.quality - a.quality;
  });

  const audios: Media<YtdlpData>[] = [
    ...YtdpFormats.filter((v) => !v.has_video && v.has_audio).map((audio) => {
      return {
        previewLink: ytdlpData.url,
        container: "mp4",
        environment: ["desktop"],
        data: {
          data: {
            ytdlpData: {
              link: link,
              ...audio,
            },
          },
          fquality: audio.quality?.toString(),
          ftype: audio.ext!,
          PATH: PATH,
          previewLink: ytdlpData.url,
          title: `${ytdlpData.title} - audioOnly`,
        },
        text: {
          str: `${audio.ext?.toUpperCase()} - (${audio.acodec?.toUpperCase()}) ${
            audio.abr
          }kbps`,
        },
        quality: audio.quality,
        id: `videoytdlp_${audio.quality}${v4()}`,
      } as Media<YtdlpData>;
    }),
  ];
  const others: Media<YtdlpData>[] = [
    ...YtdpFormats.filter((v) => v.has_video && !v.has_audio).map((video) => {
      return {
        previewLink: ytdlpData.url,
        container: "mp4",
        environment: ["desktop"],
        data: {
          data: {
            ytdlpData: {
              link: link,
              ...video,
            },
          },
          fquality: video.qualityLabel || video.format_id,
          ftype: video.ext!,
          PATH: PATH,
          previewLink: ytdlpData.url,
          title: `${ytdlpData.title} - videoOnly`,
        },
        text: {
          str: `Video Only ${video.qualityLabel || video.format_id} ${
            video.vcodec ? `${video.vcodec.toUpperCase()}` : ""
          } (.${video.ext})`,
        },
        quality: parseInt(video.qualityLabel!),
        id: `videoytdlp_${video.qualityLabel}${v4()}`,
      } as Media<YtdlpData>;
    }),
  ].sort((a, b) => {
    return b.quality - a.quality;
  });
  return {
    video: {
      thumbnail: thumbnail?.[0].url,
      medias: {
        VIDEO: videos,
        AUDIO: audios,
        OTHERS: others,
      },
      viewerUrl: ytdlpData.url,
      title: ytdlpData.title,
      duration: metaData.format.duration,
    },
  };
}
