import { Router } from "express";
import playListRouter from "./playlist";
const router = Router();
router.use("/playlist", playListRouter);
export default router;
