import { useQuery } from "@tanstack/react-query";
import Loading from "@src/components/common/Loading";
import { getSearchData } from "@src/API";
import Link from "next/link";
import { useRouter } from "next/router";
import { ErrorMessage } from "../DownloadResults";
import { SectionHeader } from "../../common/header";
export default function SearchVideoResult() {
  const { search } = useRouter().query;
  const paramQuery = useQuery({
    queryKey: ["search", search],
    queryFn: async () => {
      const res = await getSearchData(typeof search == "string" ? search : "");
      return res;
    },
    enabled: search != undefined,
  });
  if (!search) return null;
  if (paramQuery.isLoading) return <Loading />;
  if (paramQuery.isError)
    return (
      <>
        <ErrorMessage>
          ErrorHappened:
          {JSON.stringify(paramQuery.error)}
        </ErrorMessage>
      </>
    );

  return (
    <section>
      {paramQuery.data.map((val) => {
        return (
          <div key={val.id}>
            <SectionHeader>{val.title}</SectionHeader>
            <div className="tw-grid tw-gap-8 tw-mt-2 tw-grid-cols-1 sm:tw-grid-cols-2 md:tw-grid-cols-3 lg:tw-grid-cols-4">
              {val.data.map((video, i) => {
                return (
                  <Link
                    href={video.link}
                    key={i}
                    className="d-block text-decoration-none link-primary hover:tw-text-primary tw-cursor-pointer"
                  >
                    <div>
                      <img
                        src={video.thumbnail}
                        alt={video.title[0]}
                        className="tw-w-full tw-aspect-video tw-block"
                      />
                    </div>
                    <p className="pt-2 text-black tw-leading-5 tw-text-ellipsis hover:tw-text-primary tw-cursor-pointer ">
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
