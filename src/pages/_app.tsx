import "@src/setup";
import "@src/style/index.scss";
import "@fortawesome/fontawesome-svg-core/styles.css";
import "@src/style/loader.scss";
import type { AppProps } from "next/app";
import { Provider } from "react-redux";
import store from "@src/store";
import SharedLayout from "@src/components/sharout";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactElement, ReactNode, useEffect } from "react";
import { config } from "@fortawesome/fontawesome-svg-core";
import { NextPage } from "next";

config.autoAddCss = false;
const queryClient = new QueryClient();
declare module "next" {}
export type NextPageWithSpecialComponent<
  P = Record<string, unknown>,
  IP = P
> = NextPage<P, IP> & {
  getLayout?: () => ReactNode;
};
type AppPropsWithLayout = AppProps & {
  Component: NextPageWithSpecialComponent;
};
export default function App({ Component, pageProps }: AppPropsWithLayout) {
  useEffect(() => {
    require("bootstrap/dist/js/bootstrap.bundle.min.js");
  }, []);
  return (
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <SharedLayout components={Component.getLayout?.()}>
          <Component {...pageProps} />
        </SharedLayout>
      </Provider>
    </QueryClientProvider>
  );
}
