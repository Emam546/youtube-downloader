import { useContext } from "react";
import { UserContext } from "@src/context/info";
export function TextFun() {
    const data = useContext(UserContext);
    return (
        <div className="text-content-main">
            <div className="container">
                <div className="tw-py-10 tw-px-6 text-center">
                    <h3 className="tw-my-5">
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
                <div className="row">
                    <div className="col-sm-6">
                        <div>
                            <h6 className="tw-text-base tw-my-1">
                                Instructions
                            </h6>
                            <ul className="tw-list-inside tw-text-sm tw-px-1">
                                <li>
                                    1 .Search by name or directly paste the link
                                    of video you want to convert
                                </li>
                                <li>
                                    2 .Click {'"'}Start{'"'} button to begin
                                    converting process
                                </li>
                                <li>
                                    3 .Select the video/audio format you want to
                                    download, then click {'"'}Download{'"'}{" "}
                                    button
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div className="col-sm-6">
                        <div>
                            <h6 className="tw-text-base tw-my-1 tw-list-decimal">
                                Features
                            </h6>
                            <ul className="tw-list-inside tw-text-sm tw-px-1">
                                <li>• Unlimited downloads and always free</li>
                                <li>• High-speed video converter</li>
                                <li>• No registration required</li>
                                <li>• Support downloading with all formats</li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div className="row my-5 ">
                    <div className="col-sm-4">
                        <div className="text-center tw-py-5 tw-px-3">
                            <i className="fa-solid fa-gift tw-text-4xl tw-mb-3"></i>
                            <h4 className="tw-text-primary tw-font-semibold tw-my-2">
                                Free Download
                            </h4>
                            <p className="tw-text-sm">
                                Unlimited conversion and free download.
                            </p>
                        </div>
                    </div>
                    <div className="col-sm-4">
                        <div className="text-center tw-py-5 tw-px-3">
                            <i className="fa-solid fa-clapperboard tw-text-4xl tw-mb-3"></i>
                            <h4 className="tw-text-primary tw-font-semibold tw-my-2">
                                Video & Audio
                            </h4>
                            <p className="tw-text-sm">
                                Directly Download Video & Music.
                            </p>
                        </div>
                    </div>
                    <div className="col-sm-4">
                        <div className="text-center tw-py-5 tw-px-3">
                            <i className="fa-solid fa-download tw-text-4xl tw-mb-3"></i>
                            <h4 className="tw-text-primary tw-font-semibold tw-my-2">
                                Easy Download
                            </h4>
                            <p className="tw-text-sm">
                                Fully compatible with all browsers.
                            </p>
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
