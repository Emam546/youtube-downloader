import { faDownload } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import classNames from "classnames";
import React from "react";

// eslint-disable-next-line react/display-name
export const DownloadButton = React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => {
    return (
        <button
            ref={ref}
            {...props}
            className={classNames("btn btn-success download", className)}
        >
            <FontAwesomeIcon icon={faDownload} />
            <span>Download</span>
        </button>
    );
});
