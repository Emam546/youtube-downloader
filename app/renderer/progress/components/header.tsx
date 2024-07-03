import React, { ComponentProps } from "react";
import classNames from "classnames";
import { TabsType } from "..";
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
export interface State {
    type: TabsType;
    title: string;
    id: string;
}
export type TabsState = Array<State>;
export interface Props extends ComponentProps<"header"> {
    tabs: TabsState;
    selected: string;
    onSelectTab?: (state: State) => any;
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
                {tabs.map(({ id, title, ...props }) => {
                    return (
                        <Tab
                            key={id}
                            onClick={() =>
                                onSelectTab?.({ id, title, ...props })
                            }
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
