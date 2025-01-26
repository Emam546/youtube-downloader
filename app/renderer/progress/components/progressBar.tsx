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
      <div className="w-full h-5 border bg-secondary-color border-gray-600/25">
        <div
          className="h-full bg-green-600"
          style={{ width: `${Math.min(per, 100)}%` }}
        />
      </div>
    </div>
  );
}
