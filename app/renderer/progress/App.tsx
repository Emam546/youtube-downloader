import { ComponentRef, useEffect, useRef, useState } from "react";
import Header, { TabsState } from "./components/header";
import Download from "./pages/download";
import ProgressBar from "./components/progressBar";
import Footer from "./components/footer";
import Updater from "./components/updater";
import Frame, { BaseButton } from "@renderer/components/frame";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import SpeedLimiter from "./pages/speed";
import OptionsPage from "./pages/options";
const tabs: TabsState = [
    {
        id: "0",
        title: "Download Status",
        type: "Download",
    },
    {
        id: "1",
        title: "Speed limiter",
        type: "speedLimiter",
    },
    {
        id: "2",
        title: "Options on completion",
        type: "Options",
    },
];
function App(): JSX.Element {
    const [selected, setSelected] = useState(tabs[0].id);
    const selectedState = tabs.find((tab) => tab.id == selected)!;
    const ref = useRef<ComponentRef<"div">>(null);
    const frameTitle = useRef<ComponentRef<"div">>(null);
    useEffect(() => {
        if (!ref.current) return;
        if (!frameTitle.current) return;
        let prevWidth: number = 0;
        let resizeObserver = new ResizeObserver((entries) => {
            const { height } = entries[0].contentRect;
            if (height !== prevWidth) {
                prevWidth = height;
                window.api.send(
                    "setContentHeight",
                    ref.current!.offsetHeight + frameTitle.current!.offsetHeight
                );
            }
        });

        resizeObserver.observe(ref.current);
        return () => resizeObserver.disconnect();
    }, [ref, frameTitle]);
    return (
        <>
            <Frame ref={frameTitle}>
                <BaseButton
                    onClick={() => {
                        window.api.send("hideWindow");
                    }}
                    className="hover:bg-blue-600 hover:text-white"
                >
                    <FontAwesomeIcon icon={faChevronDown} />
                </BaseButton>
            </Frame>
            <div
                ref={ref}
                className="px-5 pb-5"
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
                    {selectedState.type == "speedLimiter" && <SpeedLimiter />}
                    {selectedState.type == "Options" && <OptionsPage />}
                </main>
                <ProgressBar />
                <Footer />
                <Updater />
            </div>
        </>
    );
}

export default App;
