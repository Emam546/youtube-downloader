import { logger } from "./helpers/logger";
import app from "./index";

app.on("ready", () => {
  logger.info("development");
});
