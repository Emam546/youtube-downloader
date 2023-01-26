"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const playlist_1 = __importDefault(require("./playlist"));
const router = (0, express_1.Router)();
router.use("/playlist", playlist_1.default);
exports.default = router;
