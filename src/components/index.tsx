import YoutubeResult from "./youtubeResult";
import InputHolder from "./input_componnent";
import RelatedVideos from "./relatedvideos";
import PlayList from "./playlist";
import DownloadResult from "./download_video";
export default function Downloader() {
  return (
    <main className="downloader container tw-bg-white tw-shadow lg:tw-px-12">
      <InputHolder />
      <DownloadResult />
      <YoutubeResult />
      <PlayList />
      <RelatedVideos />
    </main>
  );
}
