import axios from "axios";
import https from "https";
export const DownloadAgent = new https.Agent({
  rejectUnauthorized: false, // (NOTE: this will disable client verification)
});

export const DownloadInstance = axios.create({ httpsAgent: DownloadAgent });
