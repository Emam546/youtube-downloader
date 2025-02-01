import { ReactNode, useState } from "react";
import classnames from "classnames";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFileVideo,
  faMusic,
  faVideo,
} from "@fortawesome/free-solid-svg-icons";
import MapData, { Props as ColumnProps } from "./column";
import { Media, ResponseData, TabsType } from "../../../../scripts/types/types";

const tabs: Array<{ type: TabsType; children: React.ReactNode }> = [
  {
    children: (
      <>
        <FontAwesomeIcon icon={faVideo} />
        <span>Video</span>
      </>
    ),
    type: "VIDEO",
  },
  {
    children: (
      <>
        <FontAwesomeIcon icon={faMusic} />
        <span>Audio</span>
      </>
    ),
    type: "AUDIO",
  },
  {
    children: (
      <>
        <FontAwesomeIcon icon={faFileVideo} />
        <span>Others</span>
      </>
    ),
    type: "OTHERS",
  },
];

export type TabsData = Media[];
export interface Props {
  data: Required<ResponseData>["video"]["medias"];
  title: string;
  clippedData: ColumnProps["clippedData"];
}
export default function TableDownload({ data, clippedData, title }: Props) {
  const [state, setState] = useState<TabsType>("VIDEO");
  const { VIDEO, AUDIO, OTHERS } = data;
  return (
    <>
      <div>
        <ul className="tw-flex tw-select-none tw-m-0 tw-p-0">
          {tabs.map(({ children, type }, i) => {
            if (data[type] == undefined) return null;
            return (
              <li
                key={i}
                role="tab"
                className={classnames(
                  "tw-px-3 tw-py-2.5 tw-rounded-t-lg tw-flex tw-items-center tw-justify-center tw-gap-1.5 tw-cursor-pointer tw-font-bold ",
                  "aria-selected:tw-text-primary aria-selected:tw-bg-[#eee] aria-selected:tw-border-[#ddd] aria-selected:tw-border-b-transparent"
                )}
                aria-selected={state == type}
                onClick={() => setState(type)}
              >
                {children}
              </li>
            );
          })}
        </ul>
        <div>
          <table className="tw-w-full tw-border tw-border-[#ddd] tw-mb-5">
            <tbody>
              {state == "VIDEO" &&
                VIDEO &&
                VIDEO.map((video, i) => (
                  <MapData
                    key={video.id}
                    video={video}
                    title={title}
                    clippedData={clippedData}
                  />
                ))}
              {state == "AUDIO" &&
                AUDIO &&
                AUDIO.map((video, i) => (
                  <MapData
                    key={video.id}
                    video={video}
                    title={title}
                    clippedData={clippedData}
                  />
                ))}
              {state == "OTHERS" &&
                OTHERS &&
                OTHERS.map((video, i) => (
                  <MapData
                    key={video.id}
                    video={video}
                    title={title}
                    clippedData={clippedData}
                  />
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
