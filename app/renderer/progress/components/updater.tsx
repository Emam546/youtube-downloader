import React, { useEffect } from "react";
import { useAppDispatch } from "../store";
import { DownloadActions } from "../store/downloading";
import { StatusActions } from "../store/status";

export default function Updater() {
    const dispatch = useAppDispatch();
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
        window.api.on("onStatus", (_, { size, speed, fileSize }) => {
            dispatch(DownloadActions.setSpeed(speed));
            dispatch(DownloadActions.setDownloaded(size));
        });
        window.api.on("onConnectionStatus", (_, status) => {
            dispatch(StatusActions.setStatus(status));
        });
    }, []);
    return <></>;
}
