import YoutubeResult from "./youtubeResult";
import InputHolder from "./input_componnent";
import RelatedVideos from "./relatedvideos";
import PlayList from "./playlist";
import { useState } from "react";
import { ProgressBar } from "./youtubeViewer/progressBar";
export default function Downloader() {
    const [time, setState] = useState(0);
    return (
        <main className="downloader container tw-bg-white tw-shadow lg:tw-px-12">
            <InputHolder />
            <YoutubeResult />
            <PlayList />
            <RelatedVideos />
            {/* <ProgressBar
                curTime={time}
                duration={100}
                onSetVal={function (val: number) {
                    setState(val);
                }}
            /> */}
        </main>
    );
}
