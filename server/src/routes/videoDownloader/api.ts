import axios from "axios";
import { getInfo, videoInfo } from "ytdl-core";
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
export interface ServerVideoInfo {
    vid?: Y2mateVideoData["vid"];
    videoDetails: videoInfo["videoDetails"];
    related_videos: videoInfo["related_videos"];
    links: Y2mateVideoData["links"];
    formats: videoInfo["formats"];
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
export async function getY2mateData(id: string): Promise<ServerVideoInfo> {
    const y2mateData = await axios.post<Y2mateVideoData>(
        "https://www.y2mate.com/mates/analyzeV2/ajax",
        {
            k_query: `https://www.youtube.com/watch?v=${id}`,
            k_page: "home",
            hl: "en",
            q_auto: 0,
        },
        {
            headers: {
                "Content-Type": "multipart/form-data;",
                "User-Agent": "Your User Agent Here",
            },
        }
    );
    const googleData = await getInfo(id);
    return {
        vid: googleData.vid,
        related_videos: googleData.related_videos,
        videoDetails: googleData.videoDetails,
        links: y2mateData.data.links,
        formats: googleData.formats,
    };
}
export interface ServerConvertResults {
    dlink: Y2mateConvertResult["dlink"];
    fquality: Y2mateConvertResult["fquality"];
    ftype: Y2mateConvertResult["ftype"];
    vid: Y2mateConvertResult["vid"];
    title: Y2mateConvertResult["title"];
}
export function getFileName(title: string, quality: string, type: string) {
    return `YoutubeDownloader - ${title}_v${quality}.${type}`.replace(
        /[/\\?%*:|"<>]/g,
        "-"
    );
}
export async function convertY2mateData(
    id: string,
    key: string
): Promise<ServerConvertResults> {
    const y2mateData = await axios.post<Y2mateConvertResult>(
        "https://www.y2mate.com/mates/convertV2/index",
        {
            k: key,
            vid: id,
        },
        {
            withCredentials: true,
            headers: {
                "Content-Type": "multipart/form-data;",
                "User-Agent": "Your User Agent Here",
            },
        }
    );
    return {
        dlink: y2mateData.data.dlink,
        fquality: y2mateData.data.fquality,
        ftype: y2mateData.data.ftype,
        vid: y2mateData.data.vid,
        title: y2mateData.data.title,
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
    const response = await getHttpMethod(
        data.dlink,

        range
    );
    return [data, response];
}
