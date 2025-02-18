import { getHttpMethod } from "@utils/server";
import { IncomingMessage } from "http";

export async function DownloadTheFile(
  link: string,
  range?: string
): Promise<IncomingMessage> {
  const response = await getHttpMethod(link, range);

  if (!response.statusCode || response.statusCode >= 300) {
    switch (response.statusCode) {
      case 302:
        return await DownloadTheFile(response.headers.location!, range);

      default:
        throw new Error(
          `Sever Failed With Status Code:${
            response.statusCode || "unrecognized status code"
          }`
        );
    }
  }

  return response;
}
