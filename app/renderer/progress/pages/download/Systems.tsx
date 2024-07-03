import classNames from "classnames";
import React, { ComponentProps, useEffect, useState } from "react";
import { useAppSelector } from "../../store";
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
function humanFileSize(bytes: number, si = true, dp = 1) {
    const thresh = si ? 1024 : 1024;

    if (Math.abs(bytes) < thresh) {
        return bytes + " B";
    }

    const units = si
        ? ["kB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]
        : ["KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"];
    let u = -1;
    const r = 10 ** dp;

    do {
        bytes /= thresh;
        ++u;
    } while (
        Math.round(Math.abs(bytes) * r) / r >= thresh &&
        u < units.length - 1
    );

    return bytes.toFixed(dp) + " " + units[u];
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
function millisecondsToStr(milliseconds: number) {
    // TIP: to find current time in milliseconds, use:
    // var  current_time_milliseconds = new Date().getTime();

    function numberEnding(number) {
        return number > 1 ? "s" : "";
    }

    var temp = Math.floor(milliseconds / 1000);
    var years = Math.floor(temp / 31536000);
    if (years) {
        return years + " year" + numberEnding(years);
    }
    //TODO: Months! Maybe weeks?
    var days = Math.floor((temp %= 31536000) / 86400);
    if (days) {
        return days + " day" + numberEnding(days);
    }
    var hours = Math.floor((temp %= 86400) / 3600);
    if (hours) {
        return hours + " hour" + numberEnding(hours);
    }
    var minutes = Math.floor((temp %= 3600) / 60);
    if (minutes) {
        return minutes + " minute" + numberEnding(minutes);
    }
    var seconds = temp % 60;
    if (seconds) {
        return seconds + " second" + numberEnding(seconds);
    }
    return "less than a second"; //'just now' //or other string you like;
}
export function TimeLeftStatus() {
    let status: string | undefined = undefined;
    const { downloaded, fileSize, transferRate } = useAppSelector(
        (state) => state.download
    );
    if (fileSize && transferRate && downloaded) {
        const time = (fileSize - downloaded) / transferRate;
        status = millisecondsToStr(time);
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
                {status == true && <span className="text-red-500">{"NO"}</span>}
                {status == undefined && "......"}
            </p>
        </StatusLi>
    );
}
