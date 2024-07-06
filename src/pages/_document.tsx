import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
    return (
        <Html lang="en">
            <Head>
                <link
                    rel="icon"
                    href="/images/logo.png"
                    type="image/png"
                />
                {/* <!-- Fonts --> */}
                <link
                    rel="preconnect"
                    href="https://fonts.googleapis.com"
                />
                <link
                    rel="preconnect"
                    href="https://fonts.gstatic.com"
                    crossOrigin="anonymous"
                />
                <link
                    href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700;900&display=swap"
                    rel="stylesheet"
                />
                <meta
                    name="description"
                    content="Download YouTube videos in all formats with our fast and easy-to-use downloader. Enjoy high-quality videos offline with just a few clicks. Compatible with all devices and platforms."
                />
            </Head>
            <body>
                <Main />
                <NextScript />
            </body>
        </Html>
    );
}
