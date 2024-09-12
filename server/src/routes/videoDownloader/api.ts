/* eslint-disable @typescript-eslint/restrict-template-expressions */

import axios from "axios";
import { getInfo, videoInfo } from "@distube/ytdl-core";
import https from "https";
import http from "http";
import { IncomingMessage } from "http";
export const instance = axios.create({
    baseURL: "https://www.y2mate.com",
});

export interface VideoLink {
    size: string;
    f: string;
    q: string;
    q_text: string;
    k: string;
}

export interface VideoLinks {
    [key: string]: VideoLink;
}

interface VideoFormats {
    mp4: VideoLinks;
    mp3: VideoLinks;
    other: VideoLinks;
}

export interface Y2mateVideoData {
    status: string;
    mess: string;
    page: string;
    vid: string;
    extractor: string;
    title: string;
    t: number;
    a: string;
    links: VideoFormats;
}
export interface AdditionInfo {
    loudness: number;
}
export interface ServerVideoInfo {
    vid?: Y2mateVideoData["vid"];
    videoDetails: videoInfo["videoDetails"];
    related_videos: videoInfo["related_videos"];
    links: Y2mateVideoData["links"];
    formats: videoInfo["formats"];
    info: AdditionInfo;
}
export interface Y2mateConvertResult {
    status: string;
    mess: string;
    c_status: string;
    vid: string;
    title: string;
    ftype: string;
    fquality: string;
    dlink: string;
}
export async function WrapResponse<T>(
    fetchData: Promise<Response>
): Promise<T> {
    const res = await fetchData;
    if (res.status >= 300)
        throw new Error(`${res.statusText} With Code Status ${res.status}`);
    return (await res.json()) as T;
}
export async function fetchData(id: string): Promise<Y2mateVideoData> {
    const data = await WrapResponse<Y2mateVideoData>(
        fetch("https://www.y2mate.com/mates/en948/analyzeV2/ajax", {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                accept: "*/*",
                "accept-language":
                    "en-GB,en;q=0.9,de-GB;q=0.8,de;q=0.7,ar-EG;q=0.6,ar;q=0.5,en-US;q=0.4",
                "cache-control": "no-cache",
                "content-type": "application/x-www-form-urlencoded",
                pragma: "no-cache",
                priority: "u=1, i",
                "sec-ch-ua":
                    '"Not)A;Brand";v="99", "Google Chrome";v="127", "Chromium";v="127"',
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": '"Windows"',
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-origin",
                "x-requested-with": "XMLHttpRequest",
            },
            referrer: "https://www.y2mate.com/youtube/YtQKPJ2s86A",
            referrerPolicy: "strict-origin-when-cross-origin",
            body: new URLSearchParams({
                k_query: `https://www.youtube.com/watch?v=${id}`,
                k_page: "home",
                hl: "en",
                q_auto: "0",
            }),
            method: "POST",
            mode: "cors",
            credentials: "include",
        })
    );
    return data;
}
export async function getY2mateData(id: string): Promise<ServerVideoInfo> {
    let y2mateData: null | Y2mateVideoData = null;
    try {
        y2mateData = await fetchData(id);
    } catch (error) {
        console.log(error);
    }

    const googleData = await getInfo(id, { requestOptions: {} });
    return {
        vid: googleData.vid,
        related_videos: googleData.related_videos,
        videoDetails: googleData.videoDetails,
        links: y2mateData?.links || { mp3: {}, mp4: {}, other: {} },
        formats: googleData.formats,
        info: {
            loudness:
                googleData.player_response.playerConfig.audioConfig.loudnessDb,
        },
    };
}
export interface ServerConvertResults {
    dlink: Y2mateConvertResult["dlink"];
    fquality: Y2mateConvertResult["fquality"];
    ftype: Y2mateConvertResult["ftype"];
    vid: Y2mateConvertResult["vid"];
    title: Y2mateConvertResult["title"];
}
export type DataClipped =
    | (ServerConvertResults & {
          clipped: true;
          start: number;
          end: number;
      })
    | (ServerConvertResults & { clipped: false });
export function getFileName<T extends DataClipped>(data: T) {
    if (data.clipped) {
        return `YoutubeDownloader - ${data.title}_v${data.fquality} ${data.start}:${data.end}.${data.ftype}`.replace(
            /[/\\?%*:|"<>]/g,
            "-"
        );
    } else
        return `YoutubeDownloader - ${data.title}_v${data.fquality}.${data.ftype}`.replace(
            /[/\\?%*:|"<>]/g,
            "-"
        );
}
export async function convertY2mateData(
    id: string,
    key: string
): Promise<ServerConvertResults> {
    const data = await WrapResponse<ServerConvertResults>(
        fetch("https://www.y2mate.com/mates/convertV2/index", {
            headers: {
                accept: "*/*",
                "accept-language":
                    "en-GB,en;q=0.9,de-GB;q=0.8,de;q=0.7,ar-EG;q=0.6,ar;q=0.5,en-US;q=0.4",
                "cache-control": "no-cache",
                "content-type": "application/x-www-form-urlencoded",
                pragma: "no-cache",
                priority: "u=1, i",
                "sec-ch-ua":
                    '"Not)A;Brand";v="99", "Google Chrome";v="127", "Chromium";v="127"',
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": '"Windows"',
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-origin",
                "x-requested-with": "XMLHttpRequest",
            },
            referrer: "https://www.y2mate.com/youtube/YtQKPJ2s86A",
            referrerPolicy: "strict-origin-when-cross-origin",
            body: new URLSearchParams({
                k: key,
                vid: id,
            }),
            method: "POST",
            mode: "cors",
            credentials: "include",
        })
    );

    return {
        dlink: data.dlink,
        fquality: data.fquality,
        ftype: data.ftype,
        vid: id,
        title: data.title,
    };
}
export function getHttpMethod(dlink: string, range?: string) {
    return new Promise<IncomingMessage>((res) => {
        const headers: Record<string, string> = {
            "User-Agent": "Your User Agent Here",
        };
        if (range) headers["range"] = range;
        if (dlink.startsWith("https"))
            https.get(
                dlink,
                {
                    headers,
                },
                (response) => {
                    res(response);
                }
            );
        else
            http.get(
                dlink,
                {
                    headers,
                },
                (response) => {
                    res(response);
                }
            );
    });
}
export async function DownloadVideoFromY2Mate(
    id: string,
    key: string,

    range?: string
): Promise<[ServerConvertResults, IncomingMessage]> {
    const data = await convertY2mateData(id, key);
    const response = await getHttpMethod(data.dlink, range);
    return [data, response];
}
