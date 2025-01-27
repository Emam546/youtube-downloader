import { TextFun } from "..";
import { NextPageWithSpecialComponent } from "../_app";
import DownloadResult from "@src/components/download_video";
const Page: NextPageWithSpecialComponent = function Main() {
  return (
    <>
      <TextFun />
    </>
  );
};
Page.getLayout = function Gf() {
  return (
    <>
      <DownloadResult />
    </>
  );
};
export default Page;
