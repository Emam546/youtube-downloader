import { useEffect, useState } from "react";

export default function ProgressBar() {
  const [fileSize, setFileSize] = useState(window.context.fileSize);
  const [size, setDownloadSize] = useState(window.context.curSize);
  useEffect(() => {
    window.api.on("onDownloaded", (_, size) => setDownloadSize(size));
    window.api.on("onFileSize", (_, size) => setFileSize(size));
  }, []);
  let per = 0;
  if (fileSize && size) {
    per = +((size / fileSize) * 100).toFixed(2);
  }

  return (
    <div className="my-3">
      <div className="w-full h-5 border bg-secondary-color border-gray-600/25">
        <div className="h-full bg-green-600" style={{ width: `${per}%` }} />
      </div>
    </div>
  );
}
