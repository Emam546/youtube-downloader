import { getYtDlpName } from "@utils/index";
import { updateYtDlp as orgUpdateYtDlp } from "@utils/updateYtdlp";
import logger from "jet-logger";
import path from "path";

const ytdlpPath = path.join("./", getYtDlpName());
// eslint-disable-next-line node/no-process-env
process.env.ytdlp_binDir = ytdlpPath;
export async function updateYtDlp() {
  const download = await orgUpdateYtDlp(ytdlpPath);
  if (!download) return;

  await download.wait();
  logger.info("Ytdlp downloaded");
}
