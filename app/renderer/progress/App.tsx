import { ComponentRef, useEffect, useRef, useState } from "react";
import Header, { TabsState } from "./components/header";
import Download from "./pages/download";
import ProgressBar from "./components/progressBar";
import Footer from "./components/footer";
import Updater from "./components/updater";
const tabs: TabsState = [
    {
        id: "0",
        title: "Download Status",
        type: "Download",
    },
    // {
    //     id: "1",
    //     title: "Speed limiter",
    //     type: "speedLimiter",
    // },
    // {
    //     id: "2",
    //     title: "Options on completion",
    //     type: "Options",
    // },
];
function App(): JSX.Element {
    const [selected, setSelected] = useState(tabs[0].id);
    const selectedState = tabs.find((tab) => tab.id == selected)!;
    const ref = useRef<ComponentRef<"div">>(null);
    useEffect(() => {
        if (!ref.current) return;
        window.api.send("setContentHeight", ref.current.clientHeight);
    }, [ref]);
    return (
        <div
            ref={ref}
            className="px-5 mb-5"
        >
            <Header
                tabs={tabs}
                selected={selected}
                onSelectTab={({ id }) => {
                    setSelected(id);
                }}
            />
            <main className="bg-white px-4 py-2 min-h-[164px] overflow-hidden w-full">
                {selectedState.type == "Download" && <Download />}
                {/* {selectedState.type == "Options" && <OptionsPage />} */}
                {/* {selectedState.type == "speedLimiter" && <SpeedLimiter />} */}
            </main>
            <ProgressBar />
            <Footer />
            <Updater />
        </div>
    );
}

export default App;
