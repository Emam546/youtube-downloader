import { ConnectionStatus } from "@shared/renderer/progress";
import classNames from "classnames";
import React, { useEffect, useState } from "react";

export default function ConnectionStatusComp() {
    const [status, setStatus] = useState<ConnectionStatus>("connecting");
    useEffect(() => {
        window.api.on("onConnectionStatus", (_, status) => setStatus(status));
    }, []);
    return (
        <p>
            Status
            <span className={classNames("text-blue-600 mx-4")}>
                {status == "receiving" && "Receiving...."}
                {status == "pause" && "Pause"}
                {status == "connecting" && "Connecting ..."}
            </span>
        </p>
    );
}
