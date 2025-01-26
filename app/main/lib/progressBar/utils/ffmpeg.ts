import ffmpeg from "fluent-ffmpeg";

export function getVideoInfo(path: string) {
  return new Promise<ffmpeg.FfprobeData>((res, rej) => {
    ffmpeg.ffprobe(path, (err, metadata) => {
      if (err) rej(err);
      res(metadata);
    });
  });
}
export async function getEstimatedVideoSize(path: string, duration: number) {
  const metadata = await getVideoInfo(path);
  // Calculate the estimated output size
  const videoStream = metadata.streams.find(
    (stream) => stream.codec_type === "video"
  );
  const audioStream = metadata.streams.find(
    (stream) => stream.codec_type === "audio"
  );
  const videoBitrate: number = videoStream
    ? videoStream.bit_rate
      ? parseInt(videoStream.bit_rate)
      : 0
    : 0;
  const audioBitrate: number = audioStream
    ? audioStream.bit_rate
      ? parseInt(audioStream.bit_rate)
      : 0
    : 0;

  const estimatedSize = ((videoBitrate + audioBitrate) * duration) / 8; // in bytes

  return estimatedSize;
}
