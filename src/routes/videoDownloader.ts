import { Router } from "express";
import HttpStatusCodes from "@src/declarations/major/HttpStatusCodes";
import { getInfo, validateID } from "ytdl-core";
const router = Router();
// https://www.youtube.com/watch?v=jYZr9PZHoPY
// https://www.youtube.com/watch?v=SQnc1QibapQ&list=PLcirGkCPmbmFeQ1sm4wFciF03D_EroIfr&index=2
// https://www.youtube.com/watch?v=OrGhXL9zCPQ&list=PLcirGkCPmbmFeQ1sm4wFciF03D_EroIfr&index=3

router.get("/", async function (req, res) {
    if (
        typeof req.query.v !== "string" ||
        !validateID(req.query.v)
    )
        return res
            .status(HttpStatusCodes.BAD_REQUEST)
            .json({ status: false, msg: "the video id must be exist" });
    try{
        const data = await getInfo(req.query.v);
        res.status(200).json({ msg: "Success", status: true, data });
    }catch(err){
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        return res.status(404).json({ msg: "Success", status: true, err });
    } 
    
});

export default router;
