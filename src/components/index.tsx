import YoutubeResult from "./youtubeResult";
import InputHolder from "./input_componnent";
import RelatedVideos from "./relatedvideos";
import PlayList from "./playlist";
export default function Downloader() {
    return (
        <main className="downloader container tw-bg-white tw-shadow lg:tw-px-12">
            <InputHolder />
            <YoutubeResult />
            <PlayList />
            <RelatedVideos />
        </main>
    );
}
