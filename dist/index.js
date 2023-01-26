"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("./pre-start");
const jet_logger_1 = __importDefault(require("jet-logger"));
const EnvVars_1 = __importDefault(require("@src/declarations/major/EnvVars"));
const server_1 = __importDefault(require("./server"));
const msg = ('Express server started on port: ' + EnvVars_1.default.port.toString());
server_1.default.listen(EnvVars_1.default.port, () => jet_logger_1.default.info(msg));
