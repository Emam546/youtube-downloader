import { Router } from "express";
import HttpStatusCodes from "@serv/declarations/major/HttpStatusCodes";
import { validateID } from "@distube/ytdl-core";
import { getData, predictInputString } from "./utils";
import { Plugins } from "@serv/plugins";
import { getFileName, VideoDataClippedType } from "@utils/server";

const router = Router();
const downloads = new Map<string, VideoDataClippedType<unknown>>();
router.get("/:PATH", async function (req, res) {
  try {
    const data = await getData(req.params.PATH, req.query);
    res.status(200).json({ msg: "Success", status: true, data });
  } catch (err) {
    return res.status(404).json({
      msg: "The video is not existed",
      status: false,
      err: (err as Error).toString(),
    });
  }
});
router.post("/prepare-download", (req, res) => {
  const token = crypto.randomUUID(); // or shortid
  downloads.set(token, req.body as VideoDataClippedType<unknown>);
  setTimeout(() => downloads.delete(token), 5 * 60 * 1000); // expire in 5 min
  res.json({ msg: "Success", status: true, token });
});
router.get("/download/:token", (req, res) => {
  const data = downloads.get(req.params.token);
  if (!data) return res.status(404).send("Invalid or expired token");
  const downloader = Plugins.find((v) => v.PATH == data.PATH);
  if (!downloader) return res.status(404).send("invalid path");
  const fileName = getFileName(data);
  const encodedFilename = encodeURIComponent(fileName);
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${encodedFilename}"; filename*=UTF-8''${encodedFilename}`
  );
  downloader
    ?.download({
      curSize: 0,
      data,
      downloadingState: {
        continued: false,
        path: fileName,
      },
    })
    .download(() => res);
});
router.get("/:PATH/download", function (req, res) {
  try {
    const data = predictInputString(req.params.PATH, req.query);
    res.status(200).json({ msg: "Success", status: true, data });
  } catch (err) {
    return res.status(404).json({
      msg: "The video is not existed",
      status: false,
      err: (err as Error).toString(),
    });
  }
});
router.get("/:PATH/predict", function (req, res) {
  try {
    const data = predictInputString(req.params.PATH, req.query);
    res.status(200).json({ msg: "Success", status: true, data });
  } catch (err) {
    return res.status(404).json({
      msg: "The video is not existed",
      status: false,
      err: (err as Error).toString(),
    });
  }
});
export default router;
