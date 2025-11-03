import { Router } from "express";
import HttpStatusCodes from "@serv/declarations/major/HttpStatusCodes";
import { navigate } from "@scripts/plugins/navigate";
import logger from "jet-logger";
import { Plugins } from "@serv/plugins";
const router = Router();
router.get("/", async function (req, res) {
  if (typeof req.query.navigate !== "string")
    return res
      .status(HttpStatusCodes.BAD_REQUEST)
      .json({ status: false, msg: "the video id must be exist" });
  try {
    const search = await navigate(Plugins)(req.query.navigate);
    res.status(200).json({ msg: "Success", status: true, data: search });
  } catch (err) {
    logger.warn(err);
    return res
      .status(404)
      .json({ msg: "The Video not found", status: false, err });
  }
});

export default router;
