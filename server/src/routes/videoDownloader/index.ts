/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Router } from "express";
import HttpStatusCodes from "@serv/declarations/major/HttpStatusCodes";
import { validateID } from "ytdl-core";
import { convertY2mateData, getY2mateData } from "./api";
const router = Router();

router.get("/", async function (req, res) {
    if (typeof req.query.v !== "string" || !validateID(req.query.v))
        return res
            .status(HttpStatusCodes.BAD_REQUEST)
            .json({ status: false, msg: "the video id must be exist" });
    try {
        const data = await getY2mateData(req.query.v);
        res.status(200).json({ msg: "Success", status: true, data });
    } catch (err) {
        return res
            .status(404)
            .json({ msg: "The video is not exist", status: false, err });
    }
});
router.get("/convert", async function (req, res) {
    if (typeof req.query.vid !== "string" || !validateID(req.query.vid))
        return res
            .status(HttpStatusCodes.BAD_REQUEST)
            .json({ status: false, msg: "the video id must be exist" });
    if (typeof req.query.k !== "string")
        return res
            .status(HttpStatusCodes.BAD_REQUEST)
            .json({ status: false, msg: "the key must be exist" });
    try {
        const data = await convertY2mateData(req.query.vid, req.query.k);
        res.status(200).json({ msg: "Success", status: true, data });
    } catch (err) {
        return res
            .status(404)
            .json({ msg: "The video is not exist", status: false, err });
    }
});

export default router;
