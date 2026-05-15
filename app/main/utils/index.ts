import { is } from "@electron-toolkit/utils";
import { app } from "electron";
export const isProd =
  app.isPackaged || !is.dev || process.env.NODE_ENV == "production";
export const isDev =
  process.env.NODE_ENV == "development" && is.dev && !app.isPackaged;



