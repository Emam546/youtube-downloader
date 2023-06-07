/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Router } from "express";
import HttpStatusCodes from "@serv/declarations/major/HttpStatusCodes";
import { getInfo, validateID } from "ytdl-core";
const router = Router();
router.get("/", async function (req, res) {
    if (typeof req.query.v !== "string" || !validateID(req.query.v))
        return res
            .status(HttpStatusCodes.BAD_REQUEST)
            .json({ status: false, msg: "the video id must be exist" });
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data: any = await getInfo(req.query.v);
        delete data.response;
        delete data.player_response;
        res.status(200).json({ msg: "Success", status: true, data });
    } catch (err) {
        return res
            .status(404)
            .json({ msg: "The Video not found", status: false, err });
    }
});

export default router;
