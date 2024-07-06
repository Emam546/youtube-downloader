import { BrowserWindow } from "electron";
export const matchLinkRegex = /^youtube-downloader:\/\//;
export const youtubeLinkRegEx = /link="([^"]+)"/;
export function lunchArgs(data: string[], window: BrowserWindow) {
    const encodedUrl = data.find((v) => v.match(matchLinkRegex));
    if (encodedUrl) {
        const url = decodeURIComponent(encodedUrl).replace(matchLinkRegex, "");
        const youtubeLink = url.match(youtubeLinkRegEx);

        if (youtubeLink && youtubeLink[1])
            window.webContents.send("getYoutubeUrl", youtubeLink);
    }
}
