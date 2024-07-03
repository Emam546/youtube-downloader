import classNames from "classnames";
import { useAppSelector } from "../../store";

export default function ConnectionStatusComp() {
    const status = useAppSelector((state) => state.status.status);

    return (
        <p>
            Status
            <span className={classNames("text-blue-600 mx-4")}>
                {status == "receiving" && "Receiving...."}
                {status == "pause" && "Pause"}
                {status == "connecting" && "Connecting ..."}
                {status == "completed" && "Completed"}
            </span>
        </p>
    );
}
