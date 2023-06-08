import { configureStore } from "@reduxjs/toolkit"
import relatedVideos,{VideoInfo} from "./res-slice"
export type StoreData={
    relatedVideos:VideoInfo
}
const store=configureStore(
    {
        reducer:{
            relatedVideos:relatedVideos.reducer,
        }
    }
)

export default store