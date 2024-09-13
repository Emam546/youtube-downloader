import { useContext } from "react";
import { UserContext } from "@src/context/info";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faClapperboard,
    faDownload,
    faGift,
} from "@fortawesome/free-solid-svg-icons";
export function TextFun() {
    const data = useContext(UserContext);
    return (
        <div className="text-content-main">
            <div className="container">
                <div className="tw-py-10 tw-px-6 tw-text-center">
                    <h3 className="tw-my-3 tw-text-3xl">
                        <strong>YouTube Video Downloader</strong>
                    </h3>
                    <p className="tw-font-medium">
                        {data.siteName} allows you to convert & download video
                        from YouTube, Facebook, Video, Dailymotion, Youku, etc.
                        to Mp3, Mp4 in HD quality. {data.siteName} supports
                        downloading all video formats such as: MP4, M4V, 3GP,
                        WMV, FLV, MO, MP3, WEBM, etc. You can easily download
                        for free thousands of videos from YouTube and other
                        websites.
                    </p>
                </div>
                <div className="tw-flex">
                    <div className="tw-w-full sm:tw-w-6/12">
                        <div>
                            <h6 className="tw-my-1 tw-font-semibold tw-text-2xl">
                                Instructions
                            </h6>
                            <ul className="tw-px-1">
                                <li className="tw-py-1">
                                    1 .Search by name or directly paste the link
                                    of video you want to convert
                                </li>
                                <li className="tw-py-1">
                                    2 .Click {'"'}Start{'"'} button to begin
                                    converting process
                                </li>
                                <li className="tw-py-1">
                                    3 .Select the video/audio format you want to
                                    download, then click {'"'}Download{'"'}{" "}
                                    button
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div className="tw-w-full sm:tw-w-6/12">
                        <div>
                            <h6 className="tw-my-1 tw-font-semibold tw-text-2xl">
                                Features
                            </h6>
                            <ul className="tw-px-1">
                                <li className="tw-py-1">
                                    • Unlimited downloads and always free
                                </li>
                                <li className="tw-py-1">
                                    • High-speed video converter
                                </li>
                                <li className="tw-py-1">
                                    • No registration required
                                </li>
                                <li className="tw-py-1">
                                    • Support downloading with all formats
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div className="tw-flex tw-my-5">
                    <div className="tw-w-full sm:tw-w-4/12">
                        <div className="tw-text-center tw-py-5 tw-px-3">
                            <FontAwesomeIcon
                                icon={faGift}
                                className="tw-text-5xl tw-mb-3"
                            />

                            <h4 className="tw-text-primary tw-font-medium tw-my-2 tw-text-2xl">
                                Free Download
                            </h4>
                            <p>Unlimited conversion and free download.</p>
                        </div>
                    </div>
                    <div className="tw-w-full sm:tw-w-4/12">
                        <div className="tw-text-center tw-py-5 tw-px-3">
                            <FontAwesomeIcon
                                icon={faClapperboard}
                                className="tw-text-5xl tw-mb-3"
                            />
                            <h4 className="tw-text-primary tw-font-medium tw-my-2 tw-text-2xl">
                                Video & Audio
                            </h4>
                            <p>Directly Download Video & Music.</p>
                        </div>
                    </div>
                    <div className="tw-w-full sm:tw-w-4/12">
                        <div className="tw-text-center tw-py-5 tw-px-3">
                            <FontAwesomeIcon
                                className="tw-text-5xl tw-mb-3"
                                icon={faDownload}
                            />
                            <h4 className="tw-text-primary tw-font-medium tw-my-2 tw-text-2xl">
                                Easy Download
                            </h4>
                            <p>Fully compatible with all browsers.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function Main() {
    return (
        <>
            <TextFun />
        </>
    );
}
