import { createSlice } from "@reduxjs/toolkit";
import { relatedVideo, videoFormat } from "ytdl-core";

export type VideoInfo = relatedVideo[] | null;

const relatedVideos = createSlice({
    name: "relatedVideos",
    initialState: null as VideoInfo,
    reducers: {
        setData(state, action: { payload: VideoInfo }) {
            return action.payload;
        },
    },
});
export const videoActions = relatedVideos.actions;
export default relatedVideos;
