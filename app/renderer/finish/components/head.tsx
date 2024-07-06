import { humanFileSize } from "@renderer/utils/calc";
import png from "../assets/open-folder.png";
export default function Head() {
    return (
        <header className="flex items-center gap-x-3">
            <div>
                <img
                    src={png}
                    className="w-14"
                    alt=""
                />
            </div>
            <div className="flex-1">
                <p>Download Completed</p>
                <p>
                    Downloaded {humanFileSize(window.context.fileSize)} (
                    {window.context.fileSize} bytes)
                </p>
            </div>
        </header>
    );
}
