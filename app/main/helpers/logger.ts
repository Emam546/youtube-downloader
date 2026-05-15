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
console.log = (text) => logger.info(text);
console.error = (text) => logger.err(text);
console.warn = (text) => logger.warn(text);
console.debug = (text) => logger.warn(text);
