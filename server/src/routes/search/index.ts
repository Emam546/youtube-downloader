import { Router } from "express";
import HttpStatusCodes from "@serv/declarations/major/HttpStatusCodes";
import { getSearchData } from "./api";
import logger from "jet-logger";
const router = Router();
router.get("/", async function (req, res) {
    if (typeof req.query.search_query !== "string")
        return res
            .status(HttpStatusCodes.BAD_REQUEST)
            .json({ status: false, msg: "the video id must be exist" });
    try {
        const search = await getSearchData(req.query.search_query);
        res.status(200).json({ msg: "Success", status: true, data: search });
    } catch (err) {
        logger.warn(err);
        return res
            .status(404)
            .json({ msg: "The Video not found", status: false, err });
    }
});

export default router;
