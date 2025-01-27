import PlayList from "@src/components/playlist";
import { TextFun } from "..";
import { NextPageWithSpecialComponent } from "../_app";
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
      <PlayList />
    </>
  );
};
export default Page;
