import { Router } from "express";
import playListRouter from "./playlist";
import videoDownloader from "./videoDownloader";
import cache from "@src/util/cache";
import nodeCache from "node-cache";
import EnvVars from "@src/declarations/major/EnvVars";
import { NodeEnvs } from "@src/declarations/enums";
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
router.use("/playlist", playListRouter);
router.use("/watch", videoDownloader);
export default router;
