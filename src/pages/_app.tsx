// import "@src/style/css/normalize.css";
import "@src/style/index.scss";
import type { AppProps } from "next/app";
import { Provider } from "react-redux";
import store from "@src/store";
import SharedLayout from "@src/components/sharout";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import Script from "next/script";
const queryClient = new QueryClient();
export default function App({ Component, pageProps }: AppProps) {
    useEffect(() => {
        require("bootstrap/dist/js/bootstrap.bundle.min.js");
    }, []);
    return (
        <QueryClientProvider client={queryClient}>
            <Provider store={store}>
                <SharedLayout>
                    <Component {...pageProps} />
                </SharedLayout>
            </Provider>
        </QueryClientProvider>
    );
}
