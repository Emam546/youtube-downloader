import { Router } from "express";
import HttpStatusCodes from "@serv/declarations/major/HttpStatusCodes";
import { validateID } from "ytdl-core";
import {
    convertY2mateData,
    DownloadVideoFromY2Mate,
    getFileName,
    getY2mateData,
} from "./api";

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

router.get("/download", async function (req, res) {
    if (typeof req.query.vid !== "string" || !validateID(req.query.vid))
        return res
            .status(HttpStatusCodes.BAD_REQUEST)
            .json({ status: false, msg: "the video id must be exist" });
    if (typeof req.query.k !== "string")
        return res
            .status(HttpStatusCodes.BAD_REQUEST)
            .json({ status: false, msg: "the key must be exist" });

    await DownloadVideoFromY2Mate(
        req.query.vid,
        req.query.k,
        (data, response) => {
            if (!response.statusCode || response.statusCode >= 300)
                return res
                    .status(
                        response.statusCode ||
                            HttpStatusCodes.INTERNAL_SERVER_ERROR
                    )
                    .json({
                        msg: "Error happened on the server",
                        status: false,
                    });
            res.writeHead(response.statusCode, {
                date: response.headers["date"],
                connection: response.headers["connection"],
                "cache-control": response.headers["cache-control"],
                "content-type": response.headers["content-type"],
                "content-length": response.headers["content-length"],
                expires: response.headers["expires"],
                "accept-ranges": response.headers["accept-ranges"],
                "cf-cache-status": response.headers["cf-cache-status"],

                "content-disposition": `attachment; filename="${getFileName(
                    data.title,
                    data.fquality,
                    data.ftype
                )}"`,
            });
            response.pipe(res);
        },
        req.headers.range
    );
});
export default router;
