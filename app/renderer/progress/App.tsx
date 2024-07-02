import React, { useState } from "react";
import Header, { TabsState } from "./components/header";
import Download from "./pages/download";
import OptionsPage from "./pages/options";
import ProgressBar from "./components/progressBar";
import Footer from "./components/footer";
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
    return (
        <div className="px-5 pb-4">
            <Header
                tabs={tabs}
                selected={selected}
                onSelectTab={({ id }) => {
                    setSelected(id);
                }}
            />
            <main className="bg-white px-4 py-2 min-h-[164px] overflow-hidden w-full">
                {selectedState.type == "Download" && <Download />}
                {selectedState.type == "Options" && <OptionsPage />}
            </main>
            <ProgressBar />
            <Footer />
        </div>
    );
}

export default App;
