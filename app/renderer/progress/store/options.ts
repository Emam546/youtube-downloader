import { createSlice } from "@reduxjs/toolkit";

export enum ShutDownType {
    SHUTDOWN = "SHUT-DOWN",
    SLEEP = "SLEEP",
}
export type DownloadingDataSlice = {
    showDialog: boolean;
    otherOptions: {
        exist: boolean;
        turnoff: boolean;
        forceTurnoff: boolean;
    };
    shutDownState: ShutDownType;
};

const OptionsSlice = createSlice({
    name: "options",
    initialState: {
        showDialog: true,
        shutDownState: ShutDownType.SHUTDOWN,
        otherOptions: {
            exist: false,
            turnoff: true,
            forceTurnoff: false,
        },
    } as DownloadingDataSlice,
    reducers: {
        setShowDialog(state, action: { payload: boolean }) {
            state.showDialog = action.payload;
        },
        setOtherOptions(
            state,
            action: {
                payload: {
                    key: keyof DownloadingDataSlice["otherOptions"];
                    state: boolean;
                };
            }
        ) {
            state.otherOptions[action.payload.key] = action.payload.state;
        },
        setShutDownState(state, action: { payload: ShutDownType }) {
            state.shutDownState = action.payload;
        },
    },
});
export const OptionsActions = OptionsSlice.actions;
export default OptionsSlice;
