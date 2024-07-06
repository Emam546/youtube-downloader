import { ComponentRef, useEffect, useRef } from "react";
import Head from "./components/head";
import Footer from "./components/footer";
import Links from "./components/links";

function App(): JSX.Element {
    const ref = useRef<ComponentRef<"div">>(null);
    useEffect(() => {
        if (!ref.current) return;
        window.api.send("setContentHeight", ref.current!.clientHeight);
    }, [ref]);
    return (
        <div
            ref={ref}
            className="px-5 pb-4"
        >
            <Head />
            <main className="mt-3">
                <Links />
            </main>
            <Footer />
        </div>
    );
}

export default App;
