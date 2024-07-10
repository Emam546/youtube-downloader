import { useAppSelector } from "@renderer/progress/store";
import { OptionsActions, ShutDownType } from "@renderer/progress/store/options";
import { ComponentProps } from "react";
import { useDispatch } from "react-redux";
interface CheckLabelProps extends ComponentProps<"input"> {
    id: string;
}
export function CheckLabel({ id, children, ...props }: CheckLabelProps) {
    return (
        <div className="flex gap-x-1">
            <input
                type="checkbox"
                id={id}
                {...props}
            />
            <label htmlFor={id}>{children}</label>
        </div>
    );
}
export default function OptionsPage() {
    const {
        showDialog: option,
        shutDownState,
        otherOptions,
    } = useAppSelector((state) => state.options);
    const dispatch = useDispatch();
    return (
        <div>
            <div>
                <p>
                    Save To <span>{window.context.path}</span>
                </p>
                <CheckLabel
                    id={"show-dialog"}
                    onChange={(e) => {
                        dispatch(
                            OptionsActions.setShowDialog(e.target.checked)
                        );
                    }}
                    checked={option}
                >
                    <p>Show Download Complete Dialog</p>
                </CheckLabel>
            </div>
            <hr className="my-2" />
            <div>
                <h2
                    aria-hidden={!option}
                    className="aria-hidden:text-gray-400"
                >
                    These options are unavailable &quot;Show download complete
                    dialog&quot; is turned on
                </h2>
                <div
                    aria-disabled={option}
                    className="aria-disabled:text-gray-500"
                >
                    <CheckLabel
                        onChange={(e) => {
                            dispatch(
                                OptionsActions.setOtherOptions({
                                    key: "exist",
                                    state: e.target.checked,
                                })
                            );
                        }}
                        checked={otherOptions.exist}
                        id={"exit"}
                        disabled={option}
                    >
                        <p>Exit Youtube Download manager when done</p>
                    </CheckLabel>
                    <div className="flex gap-x-5 items-center">
                        <div>
                            <CheckLabel
                                onChange={(e) => {
                                    dispatch(
                                        OptionsActions.setOtherOptions({
                                            key: "turnoff",
                                            state: e.target.checked,
                                        })
                                    );
                                }}
                                checked={otherOptions.turnoff}
                                id={"turn-off"}
                                disabled={option}
                            >
                                <p>Turn off computer when done</p>
                            </CheckLabel>
                            <div className="ml-4">
                                <CheckLabel
                                    onChange={(e) => {
                                        dispatch(
                                            OptionsActions.setOtherOptions({
                                                key: "forceTurnoff",
                                                state: e.target.checked,
                                            })
                                        );
                                    }}
                                    checked={otherOptions.forceTurnoff}
                                    id={"force-turnoff"}
                                    disabled={option}
                                >
                                    <p>Force Shut Down</p>
                                </CheckLabel>
                            </div>
                        </div>
                        <div>
                            <select
                                className="border border-gray-800 focus:outline-none "
                                value={shutDownState}
                                onChange={(e) => {
                                    dispatch(
                                        OptionsActions.setShutDownState(
                                            e.currentTarget
                                                .value as ShutDownType
                                        )
                                    );
                                }}
                                disabled={option}
                            >
                                <option value={ShutDownType.SHUTDOWN}>
                                    Shut down
                                </option>
                                <option value={ShutDownType.SLEEP}>
                                    Sleep
                                </option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
