import { createSlice } from "@reduxjs/toolkit";
import { ConnectionStatus } from "@shared/renderer/progress";

export type DownloadingDataSlice = {
    status: ConnectionStatus;
    downloadSpeed: number;
    throttle: boolean;
};

const StatusSlice = createSlice({
    name: "status",
    initialState: {
        downloadSpeed: window.context.downloadSpeed,
        throttle: window.context.throttle,
        status: window.context.status,
    } as DownloadingDataSlice,
    reducers: {
        setStatus(state, action: { payload: ConnectionStatus }) {
            state.status = action.payload;
        },
        setDownloadSpeed(state, action: { payload: number }) {
            state.downloadSpeed = action.payload;
        },
        setThrottleState(state, action: { payload: boolean }) {
            state.throttle = action.payload;
        },
    },
});
export const StatusActions = StatusSlice.actions;
export default StatusSlice;
