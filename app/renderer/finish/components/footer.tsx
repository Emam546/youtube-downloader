import { ComponentProps } from "react";
import { Button } from "../../components/button";
import classNames from "classnames";
function ButtonFooter({ className, ...props }: ComponentProps<"button">) {
    return (
        <Button
            className={classNames(className, "py-1")}
            {...props}
        />
    );
}
export default function Footer() {
    return (
        <footer className="flex mt-5">
            <div className="flex flex-1 gap-x-3">
                <ButtonFooter
                    onClick={() => {
                        window.api.send("openFile", window.context.path);
                    }}
                >
                    Open file
                </ButtonFooter>
                <ButtonFooter
                    onClick={() => {
                        window.api.send("opeFileWith", window.context.path);
                    }}
                >
                    Open with
                </ButtonFooter>
                <ButtonFooter
                    onClick={() => {
                        const folder = window.context.path.substring(
                            0,
                            window.context.path.lastIndexOf("\\")
                        );
                        window.api.send("openFolder", folder);
                    }}
                >
                    Open Folder
                </ButtonFooter>
            </div>
            <div className={classNames("flex gap-x-6", {})}>
                <ButtonFooter
                    onClick={() => {
                        window.api.send("closeWindow");
                    }}
                >
                    Close
                </ButtonFooter>
            </div>
        </footer>
    );
}
