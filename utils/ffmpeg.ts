import { path as ffmpegpath } from "@ffmpeg-installer/ffmpeg";
import { path as ffmprobPath } from "@ffprobe-installer/ffprobe";
const ffmpegPath = ffmpegpath.replace("app.asar", "app.asar.unpacked");
const ffmpegProbe = ffmprobPath.replace("app.asar", "app.asar.unpacked");
process.env.ffmpegPath = ffmpegPath;
process.env.ffmpegProbe = ffmpegProbe;
