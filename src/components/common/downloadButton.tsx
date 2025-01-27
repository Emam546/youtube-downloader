import { faDownload } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import classNames from "classnames";
import React, { ComponentProps } from "react";
export interface Props extends ComponentProps<"button"> {
    shrink?: boolean;
    text: string;
}
// eslint-disable-next-line react/display-name
export const DownloadButton = React.forwardRef<HTMLButtonElement, Props>(
    ({ className, text, shrink, ...props }, ref) => {
        return (
            <button
                ref={ref}
                {...props}
                className={classNames(
                    "tw-bg-[#5cb85c] hover:tw-bg-[#419641] tw-transition-colors tw-text-white tw-text-center tw-whitespace-nowrap tw-px-3.5 tw-py-2 tw-rounded-md tw-space-x-2",
                    className
                )}
            >
                <FontAwesomeIcon icon={faDownload} />
                <span
                    className={classNames({
                        "tw-hidden sm:tw-inline": shrink,
                    })}
                >
                    {text}
                </span>
            </button>
        );
    }
);
