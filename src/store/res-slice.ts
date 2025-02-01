import { createSlice } from "@reduxjs/toolkit";
import { relatedVideo, videoFormat } from "@distube/ytdl-core";
import { RelatedData } from "../../scripts/types/types";

export type VideoInfo = RelatedData[] | null;

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
