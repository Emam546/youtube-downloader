import { Router } from "express";
import { DownloadFile } from "./api";
const router = Router();
function isString(val: unknown): val is string {
  return typeof val == "string" || val instanceof String;
}
router.post<Record<string, never>, unknown, { imageUrl?: unknown }>(
  "/",
  async function (req, res) {
    if (!isString(req.body.imageUrl))
      return res.status(400).json({ error: "Image URL is required" });

    const response = await DownloadFile(req.body.imageUrl);
    Object.entries(response.headers).map(([head, val]) => {
      res.setHeader(head, val as string);
    });
    response.data.pipe(res);
  }
);

export default router;
