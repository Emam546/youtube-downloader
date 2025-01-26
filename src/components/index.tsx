import YoutubeResult from "./youtubeResult";
import InputHolder from "./input_componnent";
import RelatedVideos from "./relatedvideos";
import PlayList from "./playlist";
<<<<<<< HEAD
import DownloadResult from "./download_video";
export default function Downloader() {
  return (
    <main className="downloader container tw-bg-white tw-shadow lg:tw-px-12">
      <InputHolder />
      <DownloadResult />
      <YoutubeResult />
      <PlayList />
      <RelatedVideos />
=======
import SearchVideoResult from "./searchData";
export default function Downloader() {
  return (
    <main className="container downloader tw-bg-white tw-shadow lg:tw-px-12 tw-pb-10">
      <InputHolder />
      <YoutubeResult />
      <PlayList />
      <RelatedVideos />
      <SearchVideoResult />
>>>>>>> master
    </main>
  );
}
