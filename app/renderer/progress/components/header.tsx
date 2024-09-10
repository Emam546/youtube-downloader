import React, { ComponentProps } from "react";
import classNames from "classnames";
import { TabState, TabsType } from "@renderer/shared/progress";

export function Tab({ className, ...props }: ComponentProps<"li">) {
    return (
        <li
            className={classNames(
                className,
                "border border-solid px-2 border-gray-600/20 aria-selected:bg-white aria-selected:scale-105 aria-selected:border-0 hover:bg-blue-100"
            )}
            {...props}
        />
    );
}

export type TabsState = Array<TabState>;
export interface Props extends ComponentProps<"header"> {
    tabs: TabsState;
    selected: string;
    onSelectTab?: (state: TabState) => any;
}
export default function Header({
    tabs,
    selected,
    onSelectTab,
    ...props
}: Props) {
    return (
        <header
            className="pt-2 px-1"
            {...props}
        >
            <ul className="flex">
                {tabs.map(({ id, title, enabled, ...props }) => {
                    return (
                        <Tab
                            key={id}
                            onClick={() =>
                                onSelectTab?.({ id, title, enabled, ...props })
                            }
                            aria-disabled={!enabled}
                            aria-selected={selected == id}
                        >
                            {title}
                        </Tab>
                    );
                })}
            </ul>
        </header>
    );
}
