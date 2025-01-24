import YoutubeResult from "./youtubeResult";
import InputHolder from "./input_componnent";
import RelatedVideos from "./relatedvideos";
import PlayList from "./playlist";
import SearchVideoResult from "./searchData";
export default function Downloader() {
  return (
    <main className="container downloader tw-bg-white tw-shadow lg:tw-px-12 tw-pb-10">
      <InputHolder />
      <YoutubeResult />
      <PlayList />
      <RelatedVideos />
      <SearchVideoResult />
    </main>
  );
}
