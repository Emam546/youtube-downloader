import {
    ServerConvertResults,
    getFileName,
    getHttpMethod,
} from "@serv/routes/videoDownloader/api";
import { BrowserWindow, dialog } from "electron";
import fs from "fs-extra";
export interface Options {
    title: string;
    quality: string;
    type: string;
}
export type FlagType = "w" | "a";
export function DownloadTheFile(
    path: string,
    dlink: string,
    flag: FlagType = "w",
    range: string = `bytes=0-`
) {
    return new Promise<Boolean>((res, rej) => {
        getHttpMethod(
            dlink,
            (response) => {
                if (!response.statusCode || response.statusCode >= 300) {
                    switch (response.statusCode) {
                        case 302:
                            DownloadTheFile(
                                path,
                                response.headers.location!,
                                flag,
                                range
                            )
                                .then((state) => res(state))
                                .catch((err) => rej(err));
                            break;

                        default:
                            res(false);
                    }
                }

                const stream = fs.createWriteStream(path, {
                    flags: flag,
                });

                response.pipe(stream);
                response.on("close", () => {
                    stream.close();
                });
                response.on("error", rej);
                stream.on("error", rej);
                response.on("end", () => {
                    stream.close();
                    res(true);
                });
            },
            range
        );
    });
}
export async function Downloader(
    data: ServerConvertResults,
    window: BrowserWindow
) {
    const Name = getFileName(data.title, data.fquality, data.ftype);
    const { canceled, filePath: newpath } = await dialog.showSaveDialog({
        title: "Download Video",
        defaultPath: Name,
        buttonLabel: "Save",
        properties: ["showOverwriteConfirmation", "createDirectory"],
        showsTagField: false,
    });
    if (canceled || !newpath) return;
    if (fs.pathExistsSync(newpath)) {
        const state = fs.statSync(newpath);
        const { response } = await dialog.showMessageBox(window, {
            type: "question",
            buttons: ["Yes", "No, redownload the video"],
            title: "Save",
            defaultId: 0,
            cancelId: 1,
            message: "Do you want to start from where it stopped downloading",
            detail: "Additional details can be shown here.",
        });
        if (response == 0)
            return DownloadTheFile(
                newpath,
                data.dlink,
                "a",
                `bytes=${state.size}-`
            );
    }
    return DownloadTheFile(newpath, data.dlink, "w")
        .then((res) => {
            console.log("finish downloading");
            if (!res)
                dialog.showErrorBox("Downloading failed", "Downloading failed due to the server");
        })
        .catch((err) => {
            console.error(err);
            dialog.showErrorBox(
                "Downloading failed",
                `the download failed due to unexpected error ${err}`
            );
        });
}
