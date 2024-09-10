import classNames from "classnames";
import { ComponentProps } from "react";

export function Button({ className, ...props }: ComponentProps<"button">) {
    return (
        <button
            className={classNames(
                className,
                "bg-secondary-color px-6 border border-black/25 hover:bg-blue-100 duration-75",
                "disabled:bg-secondary-color-disabled disabled:hover:bg-secondary-color-disabled"
            )}
            {...props}
        />
    );
}
