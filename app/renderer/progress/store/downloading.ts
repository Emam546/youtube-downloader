import { createSlice } from "@reduxjs/toolkit";
import { DownloadingData } from "@shared/renderer/progress";

export type DownloadingDataSlice = Partial<DownloadingData>;

const DownloadSlice = createSlice({
    name: "download",
    initialState: {} as DownloadingDataSlice,
    reducers: {
        setSpeed(state, action: { payload: number }) {
            state.transferRate = action.payload;
        },
        setResumeCapability(state, action: { payload: boolean }) {
            state.resumeCapacity = action.payload;
        },
        setFileSize(state, action: { payload: number }) {
            state.fileSize = action.payload;
        },
        setDownloaded(state, action: { payload: number }) {
            state.downloaded = action.payload;
        },
    },
});
export const DownloadActions = DownloadSlice.actions;
export default DownloadSlice;
