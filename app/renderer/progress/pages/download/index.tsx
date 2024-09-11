import {
    DownloadedStatus,
    FileSizeStatus,
    ResumeStatus,
    TimeLeftStatus,
    TransferStatus,
} from "./Systems";
import ConnectionStatusComp from "./connection";
export default function Download() {
    return (
        <div>
            <div>
                <p className="break-keep text-clip whitespace-nowrap max-w-full overflow-hidden">
                    {window.context.link}
                </p>
                <ConnectionStatusComp />
            </div>
            <div className="mt-2">
                <ul>
                    <FileSizeStatus />
                    <DownloadedStatus />
                    <TransferStatus />
                    <TimeLeftStatus />
                    <ResumeStatus />
                </ul>
            </div>
        </div>
    );
}
