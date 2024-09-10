import { createSlice } from "@reduxjs/toolkit";
import { ProgressData } from "@shared/renderer/progress";

const PageSlice = createSlice({
    name: "page",
    initialState: window.context.pageData as ProgressData,
    reducers: {
        setStatus(_, action: { payload: ProgressData }) {
            return action.payload;
        },
    },
});
export const PageActions = PageSlice.actions;
export default PageSlice;
