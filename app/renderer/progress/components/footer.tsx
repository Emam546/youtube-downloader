import { Button } from "../components/button";
import { useAppSelector } from "../store";
import classNames from "classnames";

export default function Footer() {
    const status = useAppSelector((state) => state.status.status);

    return (
        <footer className="flex mx-6">
            <div className="flex-1"></div>
            <div
                className={classNames("flex gap-x-6", {
                    hidden: status == "completed",
                })}
            >
                <Button
                    onClick={() => {
                        window.api.invoke(
                            "triggerConnection",
                            status == "pause"
                        );
                    }}
                    disabled={status == "completed"}
                >
                    {(status == "receiving" || status == "connecting") &&
                        "Pause"}
                    {status == "pause" && "Start"}
                </Button>
                <Button
                    onClick={() => {
                        window.api.send("cancel");
                    }}
                >
                    Cancel
                </Button>
            </div>
            <div
                className={classNames({
                    hidden: status != "completed",
                    visible: status == "completed",
                })}
            >
                <Button
                    onClick={() => {
                        window.api.send("closeWindow");
                    }}
                >
                    Close
                </Button>
            </div>
        </footer>
    );
}
