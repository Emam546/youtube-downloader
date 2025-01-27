import {
  ClippingDataType,
  VideoDataInfoType,
  ServerVideoInfo,
} from "@serv/routes/videoDownloader/api";
import { VideoData as MergeVideoData } from "@app/main/lib/main/mergeVideo";
import { videoFormat } from "@distube/ytdl-core";
import TableDownload, { TabsData } from "@src/components/common/table";
import { Label } from "@src/components/common/label";

export function AudioLoudnessType(
  a: number,
  b: number
): "High" | "Low" | "Same" {
  const diff = Math.abs(Math.round(a)) - Math.abs(Math.round(b));
  if (diff == 0) return "Same";
  if (a < b) return "Low";
  return "High";
}
type VideoYoutubeLink = ClippingDataType<
  Omit<VideoDataInfoType, "previewLink"> & { vid: string }
>;
type MergeVideoYoutubeLink = ClippingDataType<
  Omit<MergeVideoData, "previewLink"> & { vid: string }
>;
function downloadYoutube(data: VideoYoutubeLink) {
  return window.api.send("downloadVideoLink", {
    previewLink: `https://www.youtube.com/watch?v=${data.vid}`,
    ...data,
  });
}
function MergeVideo(data: MergeVideoYoutubeLink) {
  return window.api.send("mergeVideo", {
    previewLink: `https://www.youtube.com/watch?v=${data.vid}`,
    ...data,
  });
}
export interface Props {
  id: string;
  data: ServerVideoInfo;
  start: number;
  end: number;
  duration: number;
}
export default function YoutubeTableDownload({
  data,
  start,
  end,
  duration,
  id,
}: Props) {
  const ClippedState = start != 0 || end != duration;

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

  const videos: TabsData = [
    ...data.formats
      .filter(
        (v) =>
          v.hasVideo &&
          !v.hasAudio &&
          window.Environment == "desktop" &&
          audioMerge != undefined
      )
      .reduce((acc, v) => {
        if (
          v.container.toLowerCase() != "mp4" ||
          acc.some((g) => v.qualityLabel == g.qualityLabel)
        )
          return acc;
        return [...acc, v];
      }, [] as videoFormat[])
      .map((video) => {
        return {
          size: parseInt(video.contentLength),
          fileTypeText: (
            <>
              {video.qualityLabel} (.{video.container})
            </>
          ),
          q: video.qualityLabel,
          download() {
            if (ClippedState) {
              MergeVideo({
                vid: id,
                title: data.videoDetails.title,
                dlink: video.url,
                fquality: video.qualityLabel,
                ftype: video.container!,
                start,
                end,
                clipped: true,
                mergeData: {
                  audioLink: audioMerge!.url,
                  videoLink: video.url,
                },
              });
            } else {
              MergeVideo({
                vid: id,
                title: data.videoDetails.title,
                dlink: video.url,
                fquality: video.qualityLabel,
                ftype: video.container!,
                clipped: false,
                mergeData: {
                  audioLink: audioMerge!.url,
                  videoLink: video.url,
                },
              });
            }
          },
        };
      }),
    ...data.formats
      .filter((v) => v.hasVideo && v.hasAudio)

      .map((video) => {
        return {
          size: parseInt(video.contentLength),
          fileTypeText: (
            <>
              {video.qualityLabel} (.{video.container})
              <Label mode="blue">Faster</Label>
            </>
          ),
          q: video.qualityLabel,
          download() {
            if (window.Environment == "web") {
              const a = document.createElement("a");
              a.href = video.url;
              a.click();
            } else {
              if (ClippedState) {
                downloadYoutube({
                  vid: id,
                  title: data.videoDetails.title,
                  dlink: video.url,
                  fquality: video.qualityLabel,
                  ftype: video.container!,
                  start,
                  end,
                  clipped: true,
                });
              } else {
                downloadYoutube({
                  vid: id,
                  title: data.videoDetails.title,
                  dlink: video.url,
                  fquality: video.qualityLabel,
                  ftype: video.container!,
                  clipped: false,
                });
              }
            }
          },
        };
      }),
  ].sort((a, b) => {
    return parseInt(b.q) - parseInt(a.q);
  });

  const audios: TabsData = data.formats
    .filter((v) => v.hasAudio && !v.hasVideo)
    .map((audio) => {
      const loudnessType = AudioLoudnessType(
        audio.loudnessDb!,
        data.info.loudness
      );
      return {
        size: parseInt(audio.contentLength),
        fileTypeText: (
          <p>
            {`${audio.container.toUpperCase()} - (${audio.audioCodec?.toUpperCase()}) ${
              audio.audioBitrate
            }kbps`}
            {loudnessType != "Same" && (
              <>
                <Label mode="blue">
                  {loudnessType == "Low" && "Quiet"}
                  {loudnessType == "High" && "Loud"}
                </Label>
              </>
            )}
          </p>
        ),
        download() {
          if (window.Environment == "web") {
            const a = document.createElement("a");
            a.href = audio.url;
            a.click();
          } else {
            if (ClippedState) {
              downloadYoutube({
                vid: id,
                title: data.videoDetails.title,
                dlink: audio.url,
                fquality: audio.qualityLabel,
                ftype: audio.container!,
                start,
                end,
                clipped: true,
              });
            } else {
              downloadYoutube({
                vid: id,
                title: data.videoDetails.title,
                dlink: audio.url,
                fquality: audio.qualityLabel,
                ftype: audio.container!,
                clipped: false,
              });
            }
          }
        },
      };
    });
  const others: TabsData = data.formats
    .filter((v) => v.hasVideo && !v.hasAudio)
    .map((video) => {
      return {
        size: parseInt(video.contentLength),
        fileTypeText: (
          <p>
            {`Video Only ${
              video.qualityLabel
            } (${video.videoCodec?.toUpperCase()}) (.${video.container})`}
          </p>
        ),

        download() {
          if (window.Environment == "web") {
            const a = document.createElement("a");
            a.href = video.url;
            a.click();
          } else {
            if (ClippedState) {
              downloadYoutube({
                vid: id,
                title: data.videoDetails.title,
                dlink: video.url,
                fquality: video.qualityLabel,
                ftype: video.container!,
                start,
                end,
                clipped: true,
              });
            } else {
              downloadYoutube({
                vid: id,
                title: data.videoDetails.title,
                dlink: video.url,
                fquality: video.qualityLabel,
                ftype: video.container!,
                clipped: false,
              });
            }
          }
        },
      };
    });
  return (
    <>
      <div>
        <TableDownload
          id={id}
          data={{
            AUDIO: audios,
            OTHERS: others,
            VIDEO: videos,
          }}
        />
      </div>
    </>
  );
}
