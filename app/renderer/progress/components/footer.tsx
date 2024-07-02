import { useEffect, useState } from "react";
import { Button } from "../components/button";
import { ConnectionStatus } from "@shared/renderer/progress";

export default function Footer() {
    const [status, setStatus] = useState<ConnectionStatus>("connecting");
    useEffect(() => {
        window.api.on("onConnectionStatus", (_, status) => setStatus(status));
    }, []);
    return (
        <footer className="flex mx-6">
            <div className="flex-1"></div>
            <div className="flex gap-x-6">
                <Button
                    onClick={() => {
                        window.api.invoke(
                            "triggerConnection",
                            status == "pause"
                        );
                    }}
                >
                    {status == "receiving" ||
                        (status == "connecting" && "Pause")}
                    {status == "pause" && "Start"}
                </Button>
                <Button>Cancel</Button>
            </div>
        </footer>
    );
}
