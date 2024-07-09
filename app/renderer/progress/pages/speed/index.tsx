import React, { useEffect, useState } from "react";
import { TransferStatus } from "../download/Systems";
import classNames from "classnames";
import { useAppDispatch, useAppSelector } from "../../store";
import { StatusActions } from "../../store/status";

export default function SpeedLimiter() {
    const dispatch = useAppDispatch();
    const checked = useAppSelector((state) => state.status.throttle);
    const speed = useAppSelector((state) => state.status.downloadSpeed / 1024);
    useEffect(() => {
        window.api.invoke("setThrottle", checked);
    }, [checked]);

    return (
        <div>
            <TransferStatus />
            <div>
                <div>
                    <input
                        type="checkbox"
                        onChange={() => {
                            dispatch(StatusActions.setThrottleState(!checked));
                        }}
                        id="checkBox"
                        checked={checked}
                    />
                    <label
                        htmlFor="checkbox"
                        className="mx-1"
                    >
                        Use Speed limiter
                    </label>
                </div>
                <div className={classNames({ "text-gray-400 pt-6": !checked })}>
                    <h1>Maximum download Speed</h1>
                    <div className="flex items-center gap-x-2">
                        <input
                            className={classNames(
                                "border border-gray-600 disabled:text-gray-400 disabled:border-gray-400  hover:outline-none px-1 py-1"
                            )}
                            disabled={!checked}
                            type="number"
                            value={speed}
                            onChange={(e) => {
                                dispatch(
                                    StatusActions.setDownloadSpeed(
                                        parseFloat(e.currentTarget.value) * 1024
                                    )
                                );
                            }}
                        />
                        <p>KBbytes/sec</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
