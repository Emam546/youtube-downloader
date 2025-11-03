import { ffmpegPath, ffmpegProbe } from "@utils/ffmpeg";
import ffmpeg from "fluent-ffmpeg";

ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffmpegProbe);
