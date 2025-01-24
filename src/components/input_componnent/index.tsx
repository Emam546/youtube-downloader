import { useRouter } from "next/router";
import { youtube_parser } from "@utils/youtube";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { useForm } from "react-hook-form";
import { ChangeEvent, useEffect } from "react";
import { NavigateVideo } from "@src/types/api";
import { validateURL as ValidateUrlYoutube } from "../../../utils/youtube";
import { isValidUrl } from "@src/utils";
interface DataFrom {
  search: string;
}
function isVideo(val: unknown): val is NavigateVideo {
  return window.context != null && window.context.video != undefined;
}
export type YoutubeParams = [
  string | null,
  string | null,
  [number | null, number | null] | null
];
function constructUrl(...[id, listId, time]: YoutubeParams) {
  const url = new URL("https://www.youtube.com/watch");
  if (id) url.searchParams.set("v", id);
  if (listId && listId.startsWith("PL")) url.searchParams.set("list", listId);
  if (time && time[0]) {
    url.searchParams.set("t", `${time[0]}s`);
  }
  return url;
}
function appendPathToBaseUrl(...paths: string[]) {
  // Ensure there is exactly one slash between base URL and path
  let baseUrl = "/";
  for (let i = 0; i < paths.length; i++) {
    const path = paths[i];
    if (!baseUrl.endsWith("/")) baseUrl += "/";
    if (path.startsWith("/")) baseUrl += path.slice(1);
    else baseUrl += path;
  }

  return baseUrl;
}
const baseUrl = "/youtube/";
function extractParams(youtubeUrl: URL): YoutubeParams {
  const id = youtube_parser(youtubeUrl.href);
  const list = youtubeUrl.searchParams.get("list");
  let start =
    youtubeUrl.searchParams.get("start") || youtubeUrl.searchParams.get("t");
  const end = youtubeUrl.searchParams.get("end");
  return [
    id || null,
    list,
    [start ? parseInt(start) : null, end ? parseInt(end) : null],
  ];
}
function getPathYoutubeUrl(youtubeUrl: URL) {
  const [id, list, time] = extractParams(youtubeUrl);
  const url = id ? appendPathToBaseUrl(baseUrl, id) : baseUrl;
  const searchParams = new URLSearchParams();
  if (list) searchParams.set("list", list);
  if (time) {
    if (time[0]) searchParams.set("start", time[0].toString());
    if (time[1]) searchParams.set("end", time[1].toString());
  }
  return `${url}?${searchParams.toString()}`;
}

export function isYoutubeUrl(val: string): boolean {
  if (!isValidUrl(val)) return false;
  if (!ValidateUrlYoutube(val)) return false;
  return extractParams(new URL(val))
    .slice(0, 2)
    .some((val) => val != null);
}
export function isUrl(val: string): boolean {
  return isValidUrl(val);
}
function getTime(val: unknown): number | null {
  if (typeof val == "string" && !isNaN(parseInt(val))) return parseInt(val);
  return null;
}
export default function InputHolder() {
  const router = useRouter();
  const navigate = router.push;
  const { register, handleSubmit, setValue, formState } = useForm<DataFrom>();
  useEffect(() => {
    if (router.asPath.startsWith("/youtube")) {
      const regex = /\/youtube\/([a-zA-Z0-9]+)/;
      const match = window.location.pathname.match(regex);
      const urlParams = new URLSearchParams(window.location.search);
      const list = urlParams.get("list");
      const start = urlParams.get("start");
      const end = urlParams.get("end");
      setValue(
        "search",
        constructUrl(match ? match[1] : null, list, [
          getTime(start),
          getTime(end),
        ]).href
      );
    }
    if (router.asPath.startsWith("/search")) {
      const regex = /\/search\/(.+)/;
      const match = window.location.pathname.match(regex);
      if (!match) return;
      setValue("search", decodeURIComponent(match[1]));
    }
    if (router.asPath.startsWith("/download")) {
      const urlParams = new URLSearchParams(window.location.search);
      const link = urlParams.get("link");
      if (!link) return;
      setValue("search", decodeURIComponent(link));
    }
  }, []);
  useEffect(() => {
    function analyzeUrl(href: string) {
      setValue("search", constructUrl(...extractParams(new URL(href))).href);
    }
    if (window.Environment == "desktop") {
      window.api.on("getYoutubeUrl", (_, url) => {
        analyzeUrl(url);
      });
      if (isVideo(window.context)) analyzeUrl(window.context.video.link);
    }
  }, []);
  return (
    <div className="tw-w-[700px] tw-max-w-full tw-min-w-fit tw-mx-auto tw-px-2 sm:tw-px-10 tw-py-10">
      <form
        action=""
        method="POST"
        autoComplete="off"
        onSubmit={handleSubmit((data) => {
          const value = data.search;
          if (isYoutubeUrl(value))
            return navigate(getPathYoutubeUrl(new URL(data.search)));
          if (isUrl(value) && window.Environment == "desktop") {
            return navigate(`/download?link=${encodeURI(value)}`);
          }
          return navigate(`/search/${encodeURIComponent(value)}`);
        })}
      >
        <h2 className="tw-text-3xl tw-font-normal tw-text-center tw-mb-7">
          Download Video and Audio from YouTube
        </h2>
        <div className="tw-flex tw-mx-auto tw-my-4">
          <div className="tw-flex-grow position-relative">
            <input
              type="text"
              placeholder="Search or paste link here..."
              {...register("search", {
                onChange(e: ChangeEvent<HTMLInputElement>) {
                  const value = e.currentTarget.value;
                  if (isYoutubeUrl(value))
                    return navigate(getPathYoutubeUrl(new URL(value)));
                  if (isUrl(value) && window.Environment == "desktop") {
                    return navigate(`/download?link=${encodeURI(value)}`);
                  }
                },
              })}
              className="focus:tw-outline-none tw-flex-1 tw-shrink tw-border-[6px] tw-rounded-l tw-text-[#555] tw-bg-white tw-min-w-0 tw-w-full tw-border-r-0 tw-border-primary tw-px-3 tw-py-3 tw-h-full"
            />
          </div>
          <button
            type="submit"
            disabled={formState.isSubmitting}
            title="start"
            className="tw-text-white tw-bg-primary tw-rounded-r-3 tw-flex tw-items-center tw-gap-x-2 tw-cursor-pointer tw-p-5 sm:tw-px-6 hover:tw-bg-primary/80 tw-text-sm"
          >
            <span className="tw-hidden sm:tw-block">Start</span>
            <FontAwesomeIcon
              icon={faArrowRight}
              className="tw-font-bold tw-text-lg"
            />
          </button>
        </div>
        <p className="terms tw-text-xs tw-p-2 tw-text-center tw-text-[#666]">
          By using our service you are accepting our
          <Link
            className="tw-text-primary tw-no-underline"
            href="/terms-of-service"
          >
            Terms of Use.
          </Link>
        </p>
      </form>
    </div>
  );
}
