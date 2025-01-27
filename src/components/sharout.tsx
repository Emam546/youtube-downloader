import { UserProvider } from "@src/context/info";
import Header from "./header";
import Footer from "./footer";
import { ReactNode } from "react";
import Head from "next/head";
import InputHolder from "./input_componnent";

export default function SharedLayout({
  children,
  components,
}: {
  children: ReactNode;
  components?: ReactNode;
}) {
  return (
    <>
      <Head>
        <title>Youtube Downloader</title>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <UserProvider>
        <Header />
        <main className="container downloader tw-bg-white tw-shadow lg:tw-px-12 tw-pb-10">
          <InputHolder />
          {components}
        </main>
        {children}
        <Footer />
      </UserProvider>
    </>
  );
}
