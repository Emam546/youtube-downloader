import { Router } from "express";
import playListRouter from "./playlist";
import videoDownloader from "./videoDownloader";
import download from "./download";
import search from "./search";
import cache from "@serv/util/cache";
import nodeCache from "node-cache";
import EnvVars from "@serv/declarations/major/EnvVars";
import { NodeEnvs } from "@serv/declarations/enums";
import cors from "cors";
import { PATH as YoutubePath } from "@scripts/youtube";
const router = Router();
if (EnvVars.nodeEnv === NodeEnvs.Production)
  router.use(
    cache(
      new nodeCache({
        stdTTL: 60 * 60,
        checkperiod: 60 * 60,
      })
    )
  );
router.use(cors({ origin: "*" }));
router.use("/playlist", playListRouter);
router.use(`/${YoutubePath}`, videoDownloader);
router.use("/search", search);
router.use("/download", download);
export default router;
