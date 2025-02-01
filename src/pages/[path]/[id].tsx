import PlayList from "@src/components/playlist";
import { TextFun } from "..";
import { NextPageWithSpecialComponent } from "../_app";
import VideoResults from "@src/components/MainComponents/DownloadResults";
import RelatedVideos from "@src/components/MainComponents/relatedvideos";
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
      <VideoResults />
      <PlayList />
      <RelatedVideos />
    </>
  );
};
export default Page;
