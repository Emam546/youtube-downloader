import _getVideoId from "get-youtube-id";

const idRegex = /^[a-zA-Z0-9-_]{11}$/;
export function validateID(id: string) {
    return idRegex.test(id.trim());
}
export function getVideoID(v: string) {
    const id = _getVideoId(v);
    if (id == null) throw new Error("there is no video id");
    return id;
}
export function youtube_parser(url: string) {
    return _getVideoId(url);
}
export function validateURL(string: string) {
    const id = _getVideoId(string);
    return id != null;
}
