import {
    DownloadedStatus,
    FileSizeStatus,
    TimeLeftStatus,
    TransferStatus,
} from "./Systems";
import ConnectionStatusComp from "./connectionSTatus";
export default function Download() {
    return (
        <div className="text-sm">
            <div>
                <p className="break-keep text-clip whitespace-nowrap max-w-full overflow-hidden">{window.context.link}</p>
                <ConnectionStatusComp />
            </div>
            <div className="mt-2">
                <ul>
                    <FileSizeStatus />
                    <DownloadedStatus />
                    <TransferStatus />
                    <TimeLeftStatus />
                </ul>
            </div>
        </div>
    );
}
