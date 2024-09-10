import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../store";
import { DownloadActions } from "../store/downloading";
import { StatusActions } from "../store/status";
import { ShutDownType } from "../store/options";
import { PageActions } from "../store/pageData";

export default function Updater() {
    const dispatch = useAppDispatch();
    const { downloaded, fileSize } = useAppSelector(
        (status) => status.download
    );
    const speedLimiter = useAppSelector((state) => state.status.downloadSpeed);
    const options = useAppSelector((state) => state.options);
    useEffect(() => {
        let title: string = window.context.video.title;
        if (downloaded != undefined && fileSize != undefined) {
            title = `${Math.round((downloaded / fileSize) * 100)}% ${
                window.context.video.title
            }`;
        }
        window.api.send("setTitle", title);
        document.title = title;
    }, [downloaded, fileSize]);
    useEffect(() => {
        const t = setTimeout(() => {
            if (isNaN(speedLimiter)) return;
            const val = Math.round(parseFloat(speedLimiter.toString()));
            if (val) window.api.invoke("setSpeed", val);
        }, 3000);
        return () => clearTimeout(t);
    }, [speedLimiter]);
    useEffect(() => {
        window.api.on("onResumeCapacity", (_, state) => {
            dispatch(DownloadActions.setResumeCapability(state));
        });
        window.api.on("onDownloaded", (_, state) => {
            dispatch(DownloadActions.setDownloaded(state));
        });
        window.api.on("onFileSize", (_, state) => {
            dispatch(DownloadActions.setFileSize(state));
        });
        window.api.on("onSpeed", (_, state) => {
            dispatch(DownloadActions.setSpeed(state));
        });
        window.api.on("onConnectionStatus", (_, status) => {
            dispatch(StatusActions.setStatus(status));
        });
        window.api.on("onSetPageData", (_, data) => {
            dispatch(PageActions.setStatus(data));
        });
    }, []);
    useEffect(() => {
        return window.api.on("onEnd", () => {
            if (options.showDialog) window.api.send("showDownloadDialog");
            else {
                if (options.otherOptions.turnoff) {
                    switch (options.shutDownState) {
                        case ShutDownType.SHUTDOWN:
                            window.api.send(
                                "shutDownComputer",
                                options.otherOptions.forceTurnoff
                            );
                            break;
                        case ShutDownType.SLEEP:
                            window.api.send("sleepComputer");
                            break;
                        default:
                            throw new Error("unimplemented");
                    }
                }
                if (options.otherOptions.exist) window.api.send("quitApp");
            }
        });
    }, [options]);
    return <></>;
}
