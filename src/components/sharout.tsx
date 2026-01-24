import { UserProvider } from "@src/context/info";
import Header from "./header";
import Footer from "./footer";
import { useEffect } from "react";
import { ReactNode } from "react";
import Head from "next/head";
import InputHolder from "./input_componnent";
import { useAppSelector } from "@src/store";
import Loading from "./common/Loading";

export default function SharedLayout({
  children,
  components,
}: {
  children: ReactNode;
  components?: ReactNode;
}) {
  const isLoading = useAppSelector((s) => s.loading);
  useEffect(() => {
    if (window.Environment != "desktop") return;
    window.addEventListener("contextmenu", (e) => {
      e.preventDefault();

      // Get selected text
      const selection = window.getSelection()?.toString();
      // Send selection to main process to show menu
      window.api.send("showContextMenu", selection);
    });
    window.api.on("paste-text", (e, text) => {
      const active = document.activeElement as HTMLInputElement;
      if (
        active &&
        (active.tagName === "INPUT" || active.tagName === "TEXTAREA")
      ) {
        const start = active.selectionStart || 0;
        const end = active.selectionEnd || 0;
        const value = active.value;
        active.value = value.slice(0, start) + text + value.slice(end);
        active.selectionStart = active.selectionEnd = start + text.length; // move cursor
      }
    });
  }, []);
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
          {isLoading && <Loading />}
          {components}
        </main>
        {children}
        <Footer />
      </UserProvider>
    </>
  );
}
