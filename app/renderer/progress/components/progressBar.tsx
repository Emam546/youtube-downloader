import { useAppSelector } from "../store";

export default function ProgressBar() {
    const { fileSize, downloaded: size } = useAppSelector(
        (state) => state.download
    );
    let per = 0;
    if (fileSize && size) {
        per = +((size / fileSize) * 100).toFixed(2);
    }

    return (
        <div className="my-3">
            <div className="w-full bg-secondary-color h-5 dark:bg-gray-700 border-gray-600/25 border">
                <div
                    className="bg-green-600 h-full"
                    style={{ width: `${per}%` }}
                />
            </div>
        </div>
    );
}
