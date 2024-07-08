import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../store";
import { DownloadActions } from "../store/downloading";
import { StatusActions } from "../store/status";

function getBaseName(fullPath) {
    return fullPath.split("\\").pop();
}
export default function Updater() {
    const dispatch = useAppDispatch();
    const { downloaded, fileSize } = useAppSelector(
        (status) => status.download
    );
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
    }, []);
    return <></>;
}
