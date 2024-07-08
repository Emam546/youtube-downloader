import classNames from "classnames";
import React, { ComponentProps, useEffect, useState } from "react";
import { useAppSelector } from "../../store";
import { humanFileSize, millisecondsToStr } from "@renderer/utils/calc";
export interface StatusLiProps extends ComponentProps<"li"> {
    label: string;
}
export function StatusLi({
    label,
    children,
    className,
    ...props
}: StatusLiProps) {
    return (
        <li
            className={classNames(className, "flex")}
            {...props}
        >
            <div className="flex-shrink-0 flex-grow-0 w-[6.3rem]">
                <p>{label}</p>
            </div>
            <div className="flex-1">{children}</div>
        </li>
    );
}

export function FileSizeStatus() {
    const size = useAppSelector((state) => state.download.fileSize);

    return (
        <StatusLi label="File size">
            <p>
                {size != undefined && humanFileSize(size)}
                {size == undefined && "......"}
            </p>
        </StatusLi>
    );
}
export function DownloadedStatus() {
    const { downloaded, fileSize } = useAppSelector((state) => state.download);
    let status: string | undefined = undefined;
    if (downloaded) {
        status = humanFileSize(downloaded);
        if (fileSize)
            status = `${status} ${((downloaded / fileSize) * 100).toFixed(2)}%`;
    }

    return (
        <StatusLi label="Downloaded">
            <p>
                {status != undefined && status}
                {status == undefined && "......"}
            </p>
        </StatusLi>
    );
}
export function TransferStatus() {
    // const [speed, setSpeed] = useState<number>();
    const speed = useAppSelector((state) => state.download.transferRate);

    return (
        <StatusLi label="Transfer rate">
            <p>
                {speed != undefined && humanFileSize(speed)}
                {speed == undefined && "......"}
            </p>
        </StatusLi>
    );
}

export function TimeLeftStatus() {
    let status: string | undefined = undefined;
    const { downloaded, fileSize, transferRate } = useAppSelector(
        (state) => state.download
    );
    if (fileSize && transferRate && downloaded) {
        const time = (fileSize - downloaded) / transferRate;
        status = millisecondsToStr(time * 1000);
    }
    return (
        <StatusLi label="Time Left">
            <p>
                {status != undefined && `${status}`}
                {status == undefined && "......"}
            </p>
        </StatusLi>
    );
}

export function ResumeStatus() {
    const status = useAppSelector((state) => state.download.resumeCapacity);

    return (
        <StatusLi label="Resume capability">
            <p className="px-4">
                {status == true && `Yes`}
                {status == false && (
                    <span className="text-red-500">{"NO"}</span>
                )}
                {status == undefined && "......"}
            </p>
        </StatusLi>
    );
}
