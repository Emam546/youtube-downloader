"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const EnvVars_1 = __importDefault(require("../declarations/major/EnvVars"));
const errors = {
    validation: 'JSON-web-token validation failed.',
};
const options = {
    expiresIn: EnvVars_1.default.jwt.exp,
};
function sign(data) {
    return new Promise((res, rej) => {
        jsonwebtoken_1.default.sign(data, EnvVars_1.default.jwt.secret, options, (err, token) => {
            return err ? rej(err) : res(token || '');
        });
    });
}
function decode(jwt) {
    return new Promise((res, rej) => {
        jsonwebtoken_1.default.verify(jwt, EnvVars_1.default.jwt.secret, (err, decoded) => {
            return err ? rej(errors.validation) : res(decoded);
        });
    });
}
exports.default = {
    sign,
    decode,
};
