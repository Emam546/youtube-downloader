import ffmpeg from "fluent-ffmpeg";
import { path as ffmpegpath } from "@ffmpeg-installer/ffmpeg";
import { path as ffmprobPath } from "@ffprobe-installer/ffprobe";

export const ffmpegPath = ffmpegpath.replace("app.asar", "app.asar.unpacked");
export const ffmpegProbe = ffmprobPath.replace("app.asar", "app.asar.unpacked");
