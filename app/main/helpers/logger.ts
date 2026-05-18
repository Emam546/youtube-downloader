/* eslint-disable no-console */
import { app } from "electron";
import { jetLogger, LoggerModes } from "jet-logger";
import path from "path";
import { isDev, isProd } from "../utils";
import fs from "fs";
const logPath = path.join(app.getPath("userData"), "./app.log");
//delete the content before the start
fs.writeFileSync(logPath, "");
export const logger = jetLogger(
  app.isPackaged ? LoggerModes.File : LoggerModes.Console,
  logPath,
  false,
  false,
);
logger.info(process.env.NODE_ENV);
logger.info(`production ${isProd}`);
logger.info(`development ${isDev}`);
