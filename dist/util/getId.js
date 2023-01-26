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
Object.defineProperty(exports, "__esModule", { value: true });
exports.validVideoId = exports.youtube_playlist_parser = exports.youtube_parser = void 0;
function youtube_parser(url) {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[7].length == 11 ? match[7] : false;
}
exports.youtube_parser = youtube_parser;
function youtube_validate(url) {
    const regExp = /^(?:https?:\/\/)?(?:www\.)?youtube\.com(?:\S+)?$/;
    const match = url.match(regExp);
    return match && match.length > 0;
}
function youtube_playlist_parser(url) {
    const reg = new RegExp("[&?]list=([a-z0-9_]+)", "i");
    const match = reg.exec(url);
    if (match && match[1].length > 0 && youtube_validate(url)) {
        return match[1];
    }
    else {
        return false;
    }
}
exports.youtube_playlist_parser = youtube_playlist_parser;
function validVideoId(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const url = "http://img.youtube.com/vi/" + id + "/mqdefault.jpg";
        const { status } = yield fetch(url);
        if (status === 404)
            return false;
        return true;
    });
}
exports.validVideoId = validVideoId;
