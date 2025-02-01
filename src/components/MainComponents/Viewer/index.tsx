import { useEffect, useRef, useState } from "react";
import ReactPlayer from "react-player";
import { RangeTracker, MIN_TIME } from "./range";
import Controls, { AspectsType } from "./controls";
import classNames from "classnames";
import { ProgressBar } from "./progressBar";
import { ReactPlayerProps } from "react-player";
export interface Props {
  duration: number;
  start: number;
  end: number;
  setDuration(start: number, end: number): any;
  light?: ReactPlayerProps["light"];
  url: string;
}

export default function VideoViewer({
  url,
  duration,
  start,
  end,
  setDuration,
  light,
}: Props) {
  const [playing, setPlaying] = useState(false);
  const [curDuration, setCurDuration] = useState(start);
  const ref = useRef<ReactPlayer>(null);
  const [aspect, setAspect] = useState<AspectsType>("16:9");
  const [loopState, setLoopState] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [seekedOut, setSeekedOut] = useState(false);
  useEffect(() => {
    setCurDuration(start);
    setHasPlayed(false);
  }, [url]);
  return (
    <div>
      <div className="tw-px-2">
        <div
          className={classNames("tw-relative tw-bg-black/90", {
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
            playing={playing}
            width="100%"
            height="100%"
            onPlay={() => {
              if (!hasPlayed) {
                if (seekedOut) setPlaying(false);
                else {
                  setPlaying(true);
                  if (start > 0) ref.current?.seekTo(start);
                }
                setSeekedOut(true);
                setHasPlayed(true);
              } else {
                if (ref.current!.getCurrentTime() >= end) {
                  setCurDuration(end - MIN_TIME);
                  ref.current?.seekTo(end - MIN_TIME);
                }
                setPlaying(true);
              }
            }}
            onPause={() => {
              setPlaying(false);
            }}
            onProgress={({ playedSeconds }) => {
              setCurDuration(playedSeconds);
              if (playedSeconds < start) {
                if (hasPlayed) ref.current?.seekTo(start);
                setCurDuration(start);
              }
              if (playedSeconds >= end) {
                if (loopState) {
                  if (hasPlayed) ref.current?.seekTo(start);
                  setCurDuration(start);
                } else setPlaying(false);
              }
            }}
            onSeek={(second) => {
              setCurDuration(second);
              setSeekedOut(true);
            }}
            light={light}
            ref={ref}
            url={url}
          />
          <div className="tw-absolute tw-bottom-0 tw-left-0 tw-w-full">
            <ProgressBar
              onSetVal={(time) => {
                if (time < start) {
                  setDuration(time, end);
                }
                if (time >= end) {
                  setDuration(start, time);
                }
                ref.current?.seekTo(time);
                setCurDuration(time);
              }}
              curTime={curDuration}
              duration={duration}
            />
          </div>
        </div>
        <div>
          <RangeTracker
            duration={duration}
            end={end}
            setDuration={(newStart, newEnd) => {
              if (!playing) {
                if (newStart != start) {
                  ref.current?.seekTo(newStart);
                  setCurDuration(newStart);
                } else if (newEnd != end) {
                  ref.current?.seekTo(newEnd);
                  setCurDuration(newEnd);
                }
              } else {
                if (curDuration < start) {
                  ref.current?.seekTo(start);
                  setCurDuration(start);
                }
                if (curDuration >= end) {
                  ref.current?.seekTo(end - MIN_TIME);
                  setCurDuration(end - MIN_TIME);
                }
              }
              if (!hasPlayed) setPlaying(true);
              setSeekedOut(true);
              setDuration(newStart, newEnd);
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
          loop={loopState}
          onSetLoop={setLoopState}
          play={playing}
          start={start}
          onDuration={(newStart, newEnd) => {
            if (newStart != start) {
              ref.current?.seekTo(newStart);
              setCurDuration(newStart);
            }
            setDuration(newStart, newEnd);
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
