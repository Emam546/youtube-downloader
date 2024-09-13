import classNames from "classnames";
import { Component, ComponentProps } from "react";

export interface SectionHeader extends ComponentProps<"h3"> {}
export function SectionHeader({ className, ...props }: SectionHeader) {
    return (
        <h2
            {...props}
            className={classNames(
                "tw-text-2xl tw-font-medium tw-mb-2",
                className
            )}
        />
    );
}
