import SearchVideoResult from "@src/components/MainComponents/searchData";
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
  return <SearchVideoResult />;
};
export default Page;
