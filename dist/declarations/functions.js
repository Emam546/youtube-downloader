"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tick = exports.getRandomInt = void 0;
function getRandomInt() {
    return Math.floor(Math.random() * 1000000000000);
}
exports.getRandomInt = getRandomInt;
function tick(milliseconds) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve();
        }, milliseconds);
    });
}
exports.tick = tick;
