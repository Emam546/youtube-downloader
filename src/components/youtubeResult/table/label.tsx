import classNames from "classnames";
import { ComponentProps } from "react";

export interface LabelProps extends ComponentProps<"label"> {
    mode: "red" | "blue";
}
export function Label({ mode, ...props }: LabelProps) {
    return (
        <span
            {...props}
            className={classNames(
                props.className,
                "tw-text-white tw-px-1.5 tw-py-1 tw-rounded tw-mx-1 tw-text-sm",
                {
                    "tw-bg-blue-500": mode == "blue",
                    "tw-bg-red-500": mode == "red",
                }
            )}
        />
    );
}
