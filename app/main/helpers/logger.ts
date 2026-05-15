/* eslint-disable no-console */
import { app } from "electron";
import { jetLogger, LoggerModes } from "jet-logger";
import path from "path";
import { isDev, isProd } from "../utils";
const logPath = path.join(app.getAppPath(), "./app.log");
export const logger = jetLogger(
  app.isPackaged ? LoggerModes.File : LoggerModes.Console,
  logPath,
  false,
  false,
);
logger.info(process.env.NODE_ENV);
logger.info(`production ${isProd}`);
logger.info(`development ${isDev}`);
