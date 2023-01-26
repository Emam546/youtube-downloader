"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RouteError = void 0;
class RouteError extends Error {
    constructor(status, message) {
        super(message);
        this.status = status;
    }
}
exports.RouteError = RouteError;
