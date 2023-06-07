import { Router } from "express";
import { MergeUrl, GetData } from "youtube-playlists-js";
import HttpStatusCodes from "@serv/declarations/major/HttpStatusCodes";
const router = Router();

router.get("/", async function (req, res) {
    if (!req.query.list || typeof req.query.list !== "string")
        return res
            .status(HttpStatusCodes.BAD_REQUEST)
            .json({ status: false, msg: "the list id must be existed" });

    const data = await GetData(MergeUrl(req.query.list));
    if (!data)
        return res
            .status(HttpStatusCodes.NOT_FOUND)
            .json({ status: false, msg: "the list id is not exist" });
    res.status(200).json({ msg: "Success", status: true, data });
});

export default router;
