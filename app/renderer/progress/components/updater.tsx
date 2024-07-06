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
        if (downloaded != undefined && fileSize != undefined) {
            window.api.send(
                "setTitle",
                `${Math.round((downloaded / fileSize) * 100)}% ${getBaseName(
                    window.context.path
                )}`
            );
        } else window.api.send("setTitle", getBaseName(window.context.path));
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
