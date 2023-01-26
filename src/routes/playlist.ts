import { Router } from "express";
import getData from "youtube-playlists-js";
import HttpStatusCodes from "@src/declarations/major/HttpStatusCodes";
const router = Router();
function MergeUrl(id: string) {
    return `https://www.youtube.com/playlist?list=${id}`;
}
router.get("/", async function (req, res) {
    if (!req.query.list || typeof req.query.list !== "string")
        return res
            .status(HttpStatusCodes.BAD_REQUEST)
            .json({ status: false, msg: "the list id must be existed" });
    try {
        const data = await getData(MergeUrl(req.query.list));
        if (!data)
            return res
                .status(HttpStatusCodes.NOT_FOUND)
                .json({ status: false, msg: "the list id is not exist" });
        res.status(200).json({ msg: "Success", status: true, data });
    } catch (err) {
        res.status(HttpStatusCodes.BAD_REQUEST).json({
            msg: "Success",
            status: false,
        });
    }
});

export default router;
