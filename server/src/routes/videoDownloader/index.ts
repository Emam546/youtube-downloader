import { Router } from "express";
import HttpStatusCodes from "@serv/declarations/major/HttpStatusCodes";
import { validateID } from "@distube/ytdl-core";
import { getYoutubeData } from "./api";

const router = Router();

router.get("/", async function (req, res) {
  if (typeof req.query.v !== "string" || !validateID(req.query.v))
    return res
      .status(HttpStatusCodes.BAD_REQUEST)
      .json({ status: false, msg: "the video id must be exist" });
  try {
    const data = await getYoutubeData(req.query.v);
    res.status(200).json({ msg: "Success", status: true, data });
  } catch (err) {
    return res.status(404).json({
      msg: "The video is not exist",
      status: false,
      err: (err as Error).toString(),
    });
  }
});

export default router;
