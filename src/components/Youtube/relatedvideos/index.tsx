import { StoreData } from "@src/store";
import { useSelector } from "react-redux";
import { ReturnedSearch } from "youtube-searches";
import Link from "next/link";
import { SectionHeader } from "../../common/header";
type RelatedVideos = { title: string; id: string } & ReturnedSearch;
export default function RelatedVideos() {
  let data = useSelector<StoreData, RelatedVideos[] | undefined>(
    (state) => state.relatedVideos as any
  );

  if (!data || data.length == 0) return null;

  return (
    <section>
      <SectionHeader>Related Videos</SectionHeader>
      <div className="tw-grid tw-gap-8 tw-mt-2 tw-grid-cols-1 sm:tw-grid-cols-2 md:tw-grid-cols-3 lg:tw-grid-cols-4">
        {data.map((video, i) => {
          return (
            <Link
              href={`/youtube/${video.id}`}
              key={i}
              className="d-block text-decoration-none link-primary hover:tw-text-primary tw-cursor-pointer"
            >
              <div>
                <img
                  src={video.thumbnails.at(-1)?.url}
                  alt={video.title}
                  className="tw-w-full tw-aspect-video tw-block"
                />
              </div>
              <p className="pt-2 text-black tw-leading-5 tw-text-ellipsis hover:tw-text-primary tw-cursor-pointer ">
                {video.title}
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
