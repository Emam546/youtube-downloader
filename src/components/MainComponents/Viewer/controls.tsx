import {
  faCheck,
  faPause,
  faPlay,
  faRotateLeft,
  faRotateRight,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  convertMMSSToSeconds,
  convertSecondsToHHMMSS,
  isValidHHMMSSFormat,
} from "@src/utils";
import classNames from "classnames";
import React, { ComponentProps, useEffect, useState } from "react";
import { MIN_TIME } from "./range";
interface Props {
  aspect: AspectsType;
  setAspect?: (state: AspectsType) => any;
  duration: number;
  start: number;
  end: number;
  onSeek?: (second: number) => any;
  onSetLoop?: (state: boolean) => any;
  curTime: number;
  loop: boolean;
  play: boolean;
  onSetState?: (state: boolean) => any;
  onDuration?: (start: number, end: number) => any;
}
export function ControlButton({
  className,
  ...props
}: ComponentProps<"button">) {
  return (
    <button
      type="button"
      className={classNames(
        "flex tw-items-center tw-justify-center tw-w-12 tw-h-12 tw-bg-blue-500 hover:tw-bg-blue-600",
        className
      )}
      {...props}
    />
  );
}
interface TimeGetterProps {
  label: string;
  id: string;
  time: number;
  onTime: (time: number) => any;
}
export function FancyInput({ className, ...props }: ComponentProps<"input">) {
  return (
    <div
      className={classNames(
        "tw-relative",
        "before:tw-contents-[''] before:tw-w-0 before:tw-duration-200 before:tw-transition-[width] before:tw-absolute before:tw-bottom-0 before:focus-within:tw-w-full before:tw-left-[50%] before:-tw-translate-x-[50%] before:tw-h-[2px] before:tw-z-10 before:tw-bg-blue-500"
      )}
    >
      <input
        {...props}
        className={classNames(
          "tw-bg-transparent tw-px-2 tw-w-[4rem] tw-py-1 tw-border-b-2 tw-border-gray-600 focus:tw-outline-none hover:tw-outline-none",
          className
        )}
      />
    </div>
  );
}
function TimeGetter({ label, id, time, onTime }: TimeGetterProps) {
  const [val, setVal] = useState(convertSecondsToHHMMSS(time));
  useEffect(() => {
    setVal(convertSecondsToHHMMSS(time));
  }, [time]);
  return (
    <div className="tw-flex tw-items-center tw-gap-x-1">
      <label htmlFor={id}>{label}</label>
      <div className="tw-flex-shrink-0">
        <FancyInput
          className="tw-min-w-[6rem]"
          id={id}
          onBlur={() => {}}
          type="text"
          onChange={(e) => {
            setVal(e.currentTarget.value);
          }}
          onBlurCapture={() => {
            if (isValidHHMMSSFormat(val) && convertMMSSToSeconds(val) >= 0)
              onTime(convertMMSSToSeconds(val));
            else setVal(convertSecondsToHHMMSS(time));
          }}
          value={val}
        />
      </div>
    </div>
  );
}
interface LengthProps {
  start: number;
  end: number;
}
function LengthComp({ start, end }: LengthProps) {
  return (
    <div>
      Length:
      <span> {convertSecondsToHHMMSS(end - start)}</span>
    </div>
  );
}
interface LoopProps {
  loop: boolean;
  setLoop: (state: boolean) => any;
}
function LoopComp({ loop, setLoop }: LoopProps) {
  return (
    <div className="tw-items-center tw-flex">
      <span>Loop: </span>

      <button
        onClick={() => {
          setLoop(!loop);
        }}
        className="tw-text-xl"
        type="button"
      >
        {loop ? (
          <FontAwesomeIcon icon={faCheck} />
        ) : (
          <FontAwesomeIcon icon={faXmark} />
        )}
      </button>
    </div>
  );
}
export type AspectsType = "16:9" | "4:3";
export function FancyRadio({
  id,
  children,
  className,
  checked,
  ...props
}: ComponentProps<"input">) {
  return (
    <div>
      <label
        aria-checked={checked}
        className={classNames(
          "tw-px-3 tw-py-2.5 aria-checked:tw-bg-gray-500 aria-checked:tw-text-gray-50 tw-select-none tw-cursor-pointer"
        )}
        htmlFor={id}
      >
        {children}
      </label>
      <input
        id={id}
        {...props}
        className={classNames(className, "tw-appearance-none tw-absolute")}
        type="radio"
      />
    </div>
  );
}
export interface AspectSwitcherProps {
  state: AspectsType;
  setState?: (state: AspectsType) => any;
}
export function AspectSwitcher({ state, setState }: AspectSwitcherProps) {
  return (
    <div className="tw-flex tw-overflow-hidden tw-rounded">
      <FancyRadio
        onChange={() => setState?.("16:9")}
        checked={state == "16:9"}
        name="aspect"
        id="aspect-16:9"
      >
        16:9
      </FancyRadio>
      <FancyRadio
        name="aspect"
        onChange={() => setState?.("4:3")}
        checked={state == "4:3"}
        id="aspect-4:3"
      >
        4:3
      </FancyRadio>
    </div>
  );
}
export default function Controls({
  aspect: switcher,
  setAspect: setSwitcher,
  duration,
  end,
  loop,
  play,
  start,
  curTime,
  onDuration,
  onSeek,
  onSetLoop,
  onSetState,
}: Props) {
  return (
    <div className="tw-flex tw-justify-between tw-flex-wrap tw-gap-y-4 tw-gap-x-2">
      <div className="tw-flex tw-items-center tw-gap-x-4">
        <div className="tw-flex tw-rounded tw-overflow-hidden tw-text-gray-100 tw-text-lg">
          <ControlButton
            title="Play"
            onClick={() => {
              onSetState?.(!play);
            }}
          >
            {play ? (
              <FontAwesomeIcon icon={faPause} />
            ) : (
              <FontAwesomeIcon icon={faPlay} />
            )}
          </ControlButton>
          <ControlButton
            title="jumb to start selection"
            onClick={() => onSeek?.(start)}
          >
            <FontAwesomeIcon icon={faRotateLeft} />
          </ControlButton>
          <ControlButton
            onClick={() => onSeek?.(end - 5)}
            title="jumb to end selection"
          >
            <FontAwesomeIcon icon={faRotateRight} />
          </ControlButton>
        </div>
        <div>
          <AspectSwitcher state={switcher} setState={setSwitcher} />
        </div>
        <p className="text-lg">
          <span>{convertSecondsToHHMMSS(curTime)}</span>
          {` / `}
          <span>{convertSecondsToHHMMSS(duration)}</span>
        </p>
      </div>
      <div className="tw-flex tw-gap-x-2 tw-items-center tw-flex-wrap tw-text-lg tw-gap-y-4">
        <div className="tw-flex tw-gap-x-2 tw-items-center">
          <div>
            <TimeGetter
              id="start-input"
              label="Start:"
              onTime={(time) => {
                onDuration?.(Math.max(0, Math.min(time, end - MIN_TIME)), end);
              }}
              time={start}
            />
          </div>
          <div>
            <TimeGetter
              id="end-input"
              label="End:"
              onTime={(time) => {
                onDuration?.(
                  start,
                  Math.max(start + MIN_TIME, Math.min(time, duration))
                );
              }}
              time={end}
            />
          </div>
        </div>
        <div className="tw-flex tw-gap-x-2 tw-items-center">
          <LengthComp start={start} end={end} />
          <LoopComp loop={loop} setLoop={(state) => onSetLoop?.(state)} />
        </div>
      </div>
    </div>
  );
}
