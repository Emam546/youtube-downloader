import axios from "axios";
import https from "https";
import http from "http";
export const HttpsDownloadAgent = new https.Agent({
  rejectUnauthorized: false, // (NOTE: this will disable client verification)
});
export const HttpDownloadAgent = new http.Agent({});
export const DownloadInstance = axios.create({
  httpsAgent: HttpsDownloadAgent,
  httpAgent: HttpDownloadAgent,
});
