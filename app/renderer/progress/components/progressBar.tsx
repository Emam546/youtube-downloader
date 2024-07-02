import React, { useEffect, useState } from "react";

export default function ProgressBar() {
    const [per, setPercent] = useState(0);
    useEffect(() => {
        window.api.on("onStatus", (_, { size, fileSize }) => {
            if (!fileSize) return setPercent(0);
            setPercent(+((size / fileSize) * 100).toFixed(2));
        });
    }, []);
    return (
        <div className="my-3">
            <div className="w-full bg-secondary-color h-5 dark:bg-gray-700 border-gray-600/25 border">
                <div
                    className="bg-green-600 h-full"
                    style={{ width: `${per}%` }}
                />
            </div>
        </div>
    );
}
