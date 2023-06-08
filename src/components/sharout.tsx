import { UserProvider } from "@src/context/info";
import Header from "./header";
import Footer from "./footer";
import { ReactNode } from "react";
import Downloader from ".";
import Head from "next/head";

export default function SharedLayout({ children }: { children: ReactNode }) {
    return (
        <>
            <Head>
                <title>Youtube Downloader</title>
            </Head>
            <UserProvider>
                <Header />
                <Downloader />
                {children}
                <Footer />
            </UserProvider>
        </>
    );
}
