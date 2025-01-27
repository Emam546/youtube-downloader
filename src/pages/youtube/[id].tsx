import PlayList from "@src/components/playlist";
import { TextFun } from "..";
import { NextPageWithSpecialComponent } from "../_app";
import YoutubeResult from "@src/components/Youtube/youtubeResult";
import RelatedVideos from "@src/components/Youtube/relatedvideos";
const Page: NextPageWithSpecialComponent = function Main() {
  return (
    <>
      <TextFun />
    </>
  );
};
Page.getLayout = function () {
  return (
    <>
      <YoutubeResult />
      <PlayList />
      <RelatedVideos />
    </>
  );
};
export default Page;
