import { ComponentRef, useEffect, useRef } from "react";
import Head from "./components/head";
import Footer from "./components/footer";
import Links from "./components/links";

function App(): JSX.Element {
    const ref = useRef<ComponentRef<"div">>(null);
    useEffect(() => {
        if (!ref.current) return;
        let prevWidth: number = 0;
        let resizeObserver = new ResizeObserver((entries) => {
            const { height } = entries[0].contentRect;
            if (height !== prevWidth) {
                prevWidth = height;
                window.api.send("setContentHeight", ref.current!.offsetHeight);
            }
        });
        resizeObserver.observe(ref.current);
        return () => resizeObserver.disconnect();
    }, [ref]);
    return (
        <div
            ref={ref}
            className="px-5 pt-2 pb-4"
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
