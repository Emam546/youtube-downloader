/* eslint-disable react/display-name */
import classNames from "classnames";
import React, { ComponentRef, ComponentProps } from "react";
import { Range } from "react-range";

import { IRenderTrackParams, IThumbProps } from "react-range/lib/types";
export interface ProgressBarProps {
  curTime: number;
  duration: number;
  onSetVal: (val: number) => any;
}
export interface ThumbProps extends Omit<IThumbProps, "ref"> {
  isDragged: boolean;
}
export const Thumb = React.forwardRef<ComponentRef<"div">, ThumbProps>(
  ({ isDragged, style, ...props }, ref) => {
    return (
      <div
        ref={ref}
        style={{
          ...style,
          cursor: "pointer",
        }}
        {...props}
        className="tw-h-full hover:tw-outline-none focus:tw-outline-none -tw-translate-x-[50%] tw-cursor-pointer"
      >
        <div
          aria-selected={isDragged}
          className="tw-opacity-0 group-hover:tw-opacity-100 aria-[selected=true]:tw-opacity-100 tw-transition-opacity tw-absolute tw-top-1/2 tw-left-1/2 -tw-translate-x-1/2 -tw-translate-y-1/2 tw-bg-blue-500 tw-rounded-full tw-h-3 tw-w-3"
        ></div>
      </div>
    );
  }
);
export function ProgressBar({ curTime, duration, onSetVal }: ProgressBarProps) {
  return (
    <Range
      step={1}
      min={0}
      max={duration}
      values={[curTime]}
      onChange={([time]) => {
        onSetVal(time);
      }}
      renderTrack={({ children, props }) => (
        <div className="tw-group video-time tw-w-full tw-bg-black/25 tw-h-2 tw-relative">
          <div
            className={classNames(
              "tw-bg-blue-400 tw-h-full tw-absolute tw-left-0 tw-top-0 tw-outline-none"
            )}
            style={{
              width: `${Math.min(100, (curTime / duration) * 100)}%`,
            }}
          />
          <div className="tw-w-full tw-h-full " {...props}>
            {children}
          </div>
        </div>
      )}
      renderThumb={({ index, isDragged, value, props }) => (
        <Thumb isDragged={isDragged} {...props} />
      )}
    />
  );
}
