import ffmpeg from "fluent-ffmpeg";
import { path as ffmpegpath } from "@ffmpeg-installer/ffmpeg";
import { path as ffmprobPath } from "@ffprobe-installer/ffprobe";

ffmpeg.setFfmpegPath(ffmpegpath.replace("app.asar", "app.asar.unpacked"));
ffmpeg.setFfprobePath(ffmprobPath.replace("app.asar", "app.asar.unpacked"));
