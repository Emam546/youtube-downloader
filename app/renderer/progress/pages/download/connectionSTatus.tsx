import classNames from "classnames";
import { useAppSelector } from "../../store";
import { ConnectionStatus } from "@renderer/shared/progress";
const Values: {
    [key in ConnectionStatus]: string;
} = {
    completed: "Completed",
    connecting: "Connecting ...",
    pause: "Pause",
    rebuilding: "Rebuilding....",
    receiving: "Receiving....",
};
export default function ConnectionStatusComp() {
    const status = useAppSelector((state) => state.status.status);

    return (
        <p>
            Status
            <span className={classNames("text-blue-600 mx-4")}>
                {Values[status]}
            </span>
        </p>
    );
}
