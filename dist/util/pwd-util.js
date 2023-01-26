"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt_1 = __importDefault(require("bcrypt"));
const saltRounds = 12;
function getHash(pwd) {
    return bcrypt_1.default.hash(pwd, saltRounds);
}
function hashSync(pwd) {
    return bcrypt_1.default.hashSync(pwd, saltRounds);
}
function compare(pwd, hash) {
    return bcrypt_1.default.compare(pwd, hash);
}
exports.default = {
    getHash,
    hashSync,
    compare,
};
