"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const youtube_playlists_js_1 = require("youtube-playlists-js");
const HttpStatusCodes_1 = __importDefault(require("@src/declarations/major/HttpStatusCodes"));
const router = (0, express_1.Router)();
router.get("/", function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!req.query.list || typeof req.query.list !== "string")
            return res
                .status(HttpStatusCodes_1.default.BAD_REQUEST)
                .json({ status: false, msg: "the list id must be existed" });
        const data = yield (0, youtube_playlists_js_1.GetData)((0, youtube_playlists_js_1.MergeUrl)(req.query.list));
        if (!data)
            return res
                .status(HttpStatusCodes_1.default.NOT_FOUND)
                .json({ status: false, msg: "the list id is not exist" });
        res.status(200).json({ msg: "Success", status: true, data });
    });
});
exports.default = router;
