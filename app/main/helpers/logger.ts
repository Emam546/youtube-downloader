/* eslint-disable no-console */
import { jetLogger, LoggerModes } from "jet-logger";
import { isDev, isProd } from "../utils";

export const logger = jetLogger(
  isProd ? LoggerModes.File : LoggerModes.Console,
  "./app.log",
  false,
  false,
);
logger.info(process.env.NODE_ENV);
logger.info(`production ${isProd}`);
logger.info(`development ${isDev}`);
