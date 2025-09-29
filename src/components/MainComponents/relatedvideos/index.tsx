import { useAppSelector } from "@src/store";
import { ReturnedSearch } from "youtube-searches";
import Link from "next/link";
import { SectionHeader } from "../../common/header";
type RelatedVideos = { title: string; id: string } & ReturnedSearch;
export default function RelatedVideos() {
  const data = useAppSelector((state) => state.relatedVideos);

  if (!data || data.length == 0) return null;

  return (
    <section>
      {data.map((section, i) => {
        if (section.data.length == 0) return;
        return (
          <div key={`${section.id}-${i}`}>
            <SectionHeader>{section.title}</SectionHeader>
            <div className="tw-grid tw-gap-8 tw-mt-2 tw-grid-cols-1 sm:tw-grid-cols-2 md:tw-grid-cols-3 lg:tw-grid-cols-4">
              {section.data.map((video) => {
                return (
                  <Link
                    href={`${video.link}`}
                    key={video.id}
                    className="d-block text-decoration-none link-primary hover:tw-text-primary tw-cursor-pointer"
                  >
                    <div className="tw-aspect-video tw-bg-black">
                      <img
                        src={video.thumbnail}
                        alt={video.title[0]}
                        className="tw-h-full tw-mx-auto tw-block"
                      />
                    </div>
                    <p className="pt-2 text-black tw-leading-5 tw-text-ellipsis hover:tw-text-primary tw-cursor-pointer tw-break-words">
                      {video.title[0]}
                    </p>
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}
    </section>
  );
}
