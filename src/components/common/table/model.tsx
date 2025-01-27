import { DownloadButton } from "@src/components/common/downloadButton";
import Loading from "@src/components/common/Loading";
import ModelPopUp from "@src/components/common/Model";

export interface Props {
  onClose: () => void;
  modelState: boolean;
  title: string;
  loading?: boolean;
  onDownload: () => void;
}
export function Model({
  modelState,
  onClose,
  title,
  loading,
  onDownload,
}: Props) {
  return (
    <ModelPopUp open={modelState} title={title} onClose={onClose}>
      <div className="tw-flex tw-items-center tw-justify-center tw-mb-4">
        {!loading ? (
          <DownloadButton
            onClick={onDownload}
            text="Download"
            className="tw-min-w-[10rem]"
          />
        ) : (
          <Loading />
        )}
      </div>
      <p>
        Thank you for using our service. If you could share our website with
        your friends, that would be a great help. Thank you.
      </p>
    </ModelPopUp>
  );
}
