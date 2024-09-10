import ffmpeg from "fluent-ffmpeg";
import { path } from "@ffmpeg-installer/ffmpeg";
ffmpeg.setFfmpegPath(path.replace("app.asar", "app.asar.unpacked"));
