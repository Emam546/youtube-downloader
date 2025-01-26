/* eslint-disable react/no-unescaped-entities */
import { getYoutubeListData } from "@src/API";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import Loading from "../Loading";
import { ErrorMessage } from "../youtubeResult";
import Link from "next/link";
import { SectionHeader } from "../common/header";
import { Component, ComponentRef, useEffect, useRef } from "react";

export default function PlayList() {
  const { list: listId, id } = useRouter().query as {
    list: string;
    id?: string;
  };

  const paramQuery = useQuery({
    queryKey: ["list", listId],
<<<<<<< HEAD
    queryFn: ({ signal }) => getYoutubeListData(listId, signal),
=======
    queryFn: ({ signal }) => getListData(listId, signal),
>>>>>>> master
    enabled: listId != undefined,
    cacheTime: 1 * 1000 * 60,
    staleTime: 1 * 1000 * 60,
  });
  const scrollContainer = useRef<ComponentRef<"div">>(null);
  useEffect(() => {
    if (!listId || !paramQuery.isSuccess) return;
    if (!scrollContainer.current) return;
    const element = document.querySelector<HTMLDivElement>(
      ".list[aria-selected=true]"
    );
    if (!element) return;
    const offsetTop = element.offsetTop - scrollContainer.current.offsetTop;
    scrollContainer.current.scrollTo({
      behavior: "instant" as ScrollBehavior,
      top: offsetTop,
    });
  }, [listId, paramQuery.isSuccess, scrollContainer]);
  if (!listId || !listId.startsWith("PL")) return null;
  if (paramQuery.isLoading) {
    if (id) return null;
    else return <Loading />;
  }
  if (paramQuery.isError) {
    return (
      <ErrorMessage>
        There is a problem that occurred on the server.
      </ErrorMessage>
    );
  }

  return (
    <section className="tw-my-10">
      <SectionHeader>PlayList</SectionHeader>
      {!paramQuery.data && (
<<<<<<< HEAD
        <p className="tw-mx-3">The playlist dosen't exist</p>
=======
        <p className="tw-mx-3">The playlist doesn't exist</p>
>>>>>>> master
      )}
      <div
        className="tw-max-h-[30rem] tw-overflow-auto tw-mb-10 pr-2"
        ref={scrollContainer}
      >
        {paramQuery.data?.videos.map((video, i) => {
          return (
            <div key={`${listId}-${i}`}>
              <div
<<<<<<< HEAD
                className="list tw-flex tw-items-stretch px-3 py-3 tw-rounded-xl hover:tw-bg-blue-100 aria-selected:tw-bg-blue-50"
=======
                className="px-3 py-3 list tw-flex tw-items-stretch tw-rounded-xl hover:tw-bg-blue-100 aria-selected:tw-bg-blue-50"
>>>>>>> master
                aria-selected={id == video.videoId}
              >
                <div className="tw-flex tw-items-center">
                  <p className="tw-w-5">{i + 1}</p>
                </div>
                <div className="tw-flex-1">
                  <Link
                    href={`/youtube/${video.videoId}?list=${listId}`}
                    className="d-block text-decoration-none link-primary hover:tw-text-primary tw-cursor-pointer"
                  >
                    <div className="tw-flex tw-gap-x-3">
                      <div className="tw-w-44">
                        <img
                          src={video.thumbnails.at(-1)?.url}
                          alt={video.title}
                          className="tw-w-full tw-aspect-video tw-block"
                        />
                      </div>
                      <div className="tw-flex-1">
<<<<<<< HEAD
                        <p className="tw-leading-5 pt-2 text-black tw-text-ellipsis hover:tw-text-primary tw-cursor-pointer ">
=======
                        <p className="pt-2 text-black tw-leading-5 tw-text-ellipsis hover:tw-text-primary tw-cursor-pointer ">
>>>>>>> master
                          {video.title}
                        </p>
                      </div>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
