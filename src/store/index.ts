import { configureStore } from "@reduxjs/toolkit";
import relatedVideos, { VideoInfo } from "./res-slice";
import { TypedUseSelectorHook, useSelector } from "react-redux";
export type StoreData = {
  relatedVideos: VideoInfo;
};
const store = configureStore({
  reducer: {
    relatedVideos: relatedVideos.reducer,
  },
});
export type AppStore = typeof store;
export type RootState = ReturnType<AppStore["getState"]>;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
export default store;
