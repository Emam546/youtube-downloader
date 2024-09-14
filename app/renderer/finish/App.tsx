import { ComponentRef } from "react";
import Head from "./components/head";
import Footer from "./components/footer";
import Links from "./components/links";
import { useFitWindow } from "@renderer/utils/hooks";

function App(): JSX.Element {
  const ref = useFitWindow<ComponentRef<"div">>([]);

  return (
    <div ref={ref} className="px-5 pt-2 pb-4">
      <Head />
      <main className="mt-3">
        <Links />
      </main>
      <Footer />
    </div>
  );
}

export default App;
