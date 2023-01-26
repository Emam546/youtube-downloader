import { Router } from "express";
import getData from "@src/util/youtube-playlist";
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
    const result = await getData(MergeUrl(req.query.list));
    if (!result)
        return res
            .status(HttpStatusCodes.NOT_FOUND)
            .json({ status: false, msg: "the list id is not exist" });
    const { res: preres, data } = result;
    res.status(preres.status).json({ msg: "Success", status: true, data });
});

export default router;
