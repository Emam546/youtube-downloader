/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import nodeCache from "node-cache";
import { RequestHandler } from "express";

const cache = (cache: nodeCache, timeToLive?: number) => {
    const t = timeToLive || cache.options.stdTTL || 20;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sendFun: RequestHandler = function (req, res: any, next) {
        if (req.method != "GET") return next();

        const url = req.originalUrl;
        const result = cache.get(url);
        if (result) {
            res.send(result);
        } else {
            res.originalSend = res.send;
            res.send = (body: string) => {
                res.originalSend(body);
                cache.set(url, body, t);
            };
            next();
        }
    };
    return sendFun;
};
export default cache;
