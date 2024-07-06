import classNames from "classnames";
import React, { ComponentProps } from "react";
function InputFun({ className, ...props }: ComponentProps<"input">) {
    return (
        <input
            className={classNames(
                "border border-black/80 block w-full p-0.5 px-2 bg-transparent hover:outline-none focus:outline-none",
                className
            )}
            type="text"
            {...props}
        />
    );
}
export default function Links() {
    return (
        <div>
            <div className="mt-2">
                <h1 className="mb-1">Address</h1>
                <InputFun value={window.context.link} />
            </div>
            <div className="mt-2">
                <h1 className="mb-1">The file saved as</h1>
                <InputFun value={window.context.path} />
            </div>
        </div>
    );
}
