"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const morgan_1 = __importDefault(require("morgan"));
const path_1 = __importDefault(require("path"));
const helmet_1 = __importDefault(require("helmet"));
const express_1 = __importDefault(require("express"));
require("express-async-errors");
const routes_1 = __importDefault(require("./routes"));
const jet_logger_1 = __importDefault(require("jet-logger"));
const EnvVars_1 = __importDefault(require("@src/declarations/major/EnvVars"));
const HttpStatusCodes_1 = __importDefault(require("@src/declarations/major/HttpStatusCodes"));
const enums_1 = require("@src/declarations/enums");
const classes_1 = require("@src/declarations/classes");
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)({ origin: "*" }));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)(EnvVars_1.default.cookieProps.secret));
if (EnvVars_1.default.nodeEnv === enums_1.NodeEnvs.Dev) {
    app.use((0, morgan_1.default)("dev"));
}
if (EnvVars_1.default.nodeEnv === enums_1.NodeEnvs.Production) {
    app.use((0, helmet_1.default)());
}
app.use("/api", routes_1.default);
app.use((err, _, res, next) => {
    jet_logger_1.default.err(err, true);
    let status = HttpStatusCodes_1.default.BAD_REQUEST;
    if (err instanceof classes_1.RouteError) {
        status = err.status;
    }
    return res
        .status(status)
        .json({ msg: "error", status: false, error: err.message });
});
const staticDir = path_1.default.join(__dirname, "public");
app.use(express_1.default.static(staticDir));
exports.default = app;
