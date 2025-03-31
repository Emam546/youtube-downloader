import { Router } from "express";
import HttpStatusCodes from "@serv/declarations/major/HttpStatusCodes";
import { validateID } from "@distube/ytdl-core";
import { getData, predictInputString } from "@scripts/youtube";

const router = Router();

router.get("/", async function (req, res) {
  if (typeof req.query.id !== "string" || !validateID(req.query.id))
    return res
      .status(HttpStatusCodes.BAD_REQUEST)
      .json({ status: false, msg: "the video id must be exist" });
  try {
    const data = await getData(req.query);
    res.status(200).json({ msg: "Success", status: true, data });
  } catch (err) {
    return res.status(404).json({
      msg: "The video is not exist",
      status: false,
      err: (err as Error).toString(),
    });
  }
});
router.get("/predict", function (req, res) {
  try {
    const data = predictInputString(req.query);
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
