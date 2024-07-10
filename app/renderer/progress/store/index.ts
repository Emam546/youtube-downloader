import { configureStore } from "@reduxjs/toolkit";
import downloadingSlice from "./downloading";
import StatusSlice from "./status";
import OptionsSlice from "./options";
import type { TypedUseSelectorHook } from "react-redux";
import { useDispatch, useSelector, useStore } from "react-redux";

const store = configureStore({
    reducer: {
        [downloadingSlice.name]: downloadingSlice.reducer,
        [StatusSlice.name]: StatusSlice.reducer,
        [OptionsSlice.name]: OptionsSlice.reducer,
    },
});

export type AppStore = typeof store;

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore["getState"]>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = AppStore["dispatch"];
// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
export const useAppStore: () => AppStore = useStore;

export default store;
