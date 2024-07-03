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
                <meta charSet="UTF-8" />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1.0"
                />
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
