import "./frame.css";
import React, {
    ComponentProps,
    ComponentRef,
    useEffect,
    useState,
} from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMinus, faXmark } from "@fortawesome/free-solid-svg-icons";
import { faSquare } from "@fortawesome/free-regular-svg-icons";
import classNames from "classnames";
import icon from "../../../build/icon.ico";
export function BaseButton({ className, ...props }: ComponentProps<"button">) {
    return (
        <button
            type="button"
            className={classNames("p-2 px-6 duration-100", className)}
            {...props}
        />
    );
}
const Frame = React.forwardRef<ComponentRef<"div">, ComponentProps<"div">>(
    ({ className, children, ...props }, ref) => {
        const [title, setTitle] = useState(document.title);
        useEffect(() => {
            new MutationObserver(function () {
                setTitle(document.title);
            }).observe(document.querySelector("title")!, {
                subtree: true,
                characterData: true,
                childList: true,
            });
        }, []);
        return (
            <div
                ref={ref}
                {...props}
                className="flex items-center justify-between max-w-full bg-white frame-drag"
            >
                <div className="flex items-center flex-1 px-1 gap-x-2">
                    <img
                        src={icon}
                        className="w-5"
                        alt=""
                    />
                    <p className="max-w-xs overflow-hidden text-ellipsis whitespace-nowrap">
                        {title}
                    </p>
                </div>
                <div className="flex">
                    <div>{children}</div>
                    <div className="flex justify-end">
                        <BaseButton
                            title="Minimize"
                            type="button"
                            className="hover:bg-gray-200"
                            onClick={() => {
                                window.api.send("minimizeWindow");
                            }}
                        >
                            <FontAwesomeIcon icon={faMinus} />
                        </BaseButton>
                        <BaseButton
                            disabled={true}
                            type="button"
                            className="enabled:hover:bg-gray-200 disabled:text-gray-300"
                            onClick={() => {
                                window.api.send("ToggleWindowMaximizeState");
                            }}
                        >
                            <FontAwesomeIcon icon={faSquare} />
                        </BaseButton>
                        <BaseButton
                            title="Close"
                            type="button"
                            className="hover:bg-red-600 hover:text-white"
                            onClick={() => {
                                window.api.send("closeWindow");
                            }}
                        >
                            <FontAwesomeIcon
                                className="text-xl"
                                icon={faXmark}
                            />
                        </BaseButton>
                    </div>
                </div>
            </div>
        );
    }
);
export default Frame;
