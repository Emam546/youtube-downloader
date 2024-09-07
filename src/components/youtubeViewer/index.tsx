/* eslint-disable react/display-name */
import { useEffect, useRef, useState } from "react";
import { Range } from "react-range";
import ReactPlayer from "react-player/youtube";
import { ProgressBar, RangeTracker, Thumb, Tracker } from "./range";
import Controls, { AspectsType, ControlButton } from "./controls";
import classNames from "classnames";
export interface Props {
    id: string;
    duration: number;
    start: number;
    end: number;
    setDuration(start: number, end: number): any;
}
export default function VideoViewer({
    id,
    duration,
    start,
    end,
    setDuration,
}: Props) {
    const [playing, setPlaying] = useState(false);
    const [curDuration, setCurDuration] = useState(start);
    const ref = useRef<ReactPlayer>(null);
    const [aspect, setAspect] = useState<AspectsType>("16:9");

    useEffect(() => {
        setCurDuration(0);
    }, [id]);
    useEffect(() => {
        if (!ref.current) return;
        ref.current;
    }, [ref, id]);
    return (
        <div>
            <div className="tw-px-2">
                <div
                    className={classNames("tw-relative", {
                        "tw-aspect-video": aspect == "16:9",
                        "tw-aspect-[4/3]": aspect == "4:3",
                    })}
                >
                    <ReactPlayer
                        style={{
                            position: "absolute",
                            width: "100%",
                            top: 0,
                            left: 0,
                        }}
                        width="100%"
                        height="100%"
                        playing={playing}
                        onPlay={() => {
                            setPlaying(true);
                        }}
                        onPause={() => {
                            setPlaying(false);
                        }}
                        onProgress={({ playedSeconds }) => {
                            setCurDuration(playedSeconds);
                            if (playedSeconds < start) {
                                ref.current?.seekTo(start);
                                setCurDuration(start);
                            }
                            if (playedSeconds > end) {
                                ref.current?.seekTo(start);
                                setPlaying(false);
                                setCurDuration(start);
                            }
                        }}
                        onSeek={(second) => {
                            setCurDuration(second);
                        }}
                        ref={ref}
                        url={`https://www.youtube.com/watch?v=${id}`}
                    />
                    <div className="tw-absolute tw-bottom-0 tw-left-0 tw-w-full">
                        <ProgressBar percent={(curDuration / duration) * 100} />
                    </div>
                </div>
                <div>
                    <RangeTracker
                        duration={duration}
                        end={end}
                        setDuration={(newSTart, newEnd) => {
                            if (newSTart != start) {
                                ref.current?.seekTo(newSTart);
                                setCurDuration(newSTart);
                            }
                            setDuration(newSTart, newEnd);
                        }}
                        start={start}
                    />
                </div>
            </div>
            <div className="py-2">
                <Controls
                    aspect={aspect}
                    setAspect={setAspect}
                    curTime={curDuration}
                    duration={duration}
                    end={end}
                    loop
                    play={playing}
                    start={start}
                    onDuration={(newSTart, newEnd) => {
                        if (newSTart != start) {
                            ref.current?.seekTo(newSTart);
                            setCurDuration(newSTart);
                        }
                        setDuration(newSTart, newEnd);
                    }}
                    onSeek={(second) => {
                        ref.current?.seekTo(second);
                        setCurDuration(second);
                    }}
                    onSetState={setPlaying}
                />
            </div>
        </div>
    );
}
