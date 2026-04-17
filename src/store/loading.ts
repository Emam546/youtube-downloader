import { createSlice } from "@reduxjs/toolkit";
import { RelatedData } from "../../scripts/types/types";

export type LoadingState = boolean;
const states: Record<string, boolean> = {};
const loadingState = createSlice({
  name: "loadingVideos",
  initialState: false,
  reducers: {
    setData(state, action: { payload: { name: string; state: boolean } }) {
      states[action.payload.name] = action.payload.state;
      return Array.from(Object.values(states)).some((v) => v == true);
    },
  },
});
export const loadingActions = loadingState.actions;
export default loadingState;
