import YoutubeResult from "./youtubeResult";
import InputHolder from "./input_componnent";
import RelatedVideos from "./relatedvideos";
export default function Downloader(){
    return <main className="downloader  container tw-bg-white  tw-shadow lg:tw-px-12">
        <InputHolder />
        <YoutubeResult />
        <RelatedVideos />
    </main>
}