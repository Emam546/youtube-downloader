import { getHttpMethod } from "@serv/routes/videoDownloader/api";
import { IncomingMessage } from "http";
export type FlagType = "w" | "a";
export async function DownloadTheFile(
    link: string,
    range?: string
): Promise<IncomingMessage> {
    const response = await getHttpMethod(link, range);

    if (!response.statusCode || response.statusCode >= 300) {
        switch (response.statusCode) {
            case 302:
                return await DownloadTheFile(link, range);

            default:
                throw new Error(`${response.statusCode}`);
        }
    }

    return response;
}
