import axios, { AxiosResponse } from "axios";
import internal from "stream";

export async function DownloadFile(
    url: string
): Promise<AxiosResponse<internal.Writable, any>> {
    return await axios.get<internal.Writable>(url, {
        responseType: "stream",
    });
}
