import { useRouter } from "next/router";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { useForm } from "react-hook-form";
import { ChangeEvent, useEffect } from "react";
import { NavigateVideo } from "@src/types/api";
import { navigate } from "@src/API/navigate";
import { predictInputStr } from "@src/API";
interface DataFrom {
  search: string;
}
function isVideo(val: unknown): val is NavigateVideo {
  return window.context != null && window.context.video != undefined;
}

function getTime(val: unknown): number | null {
  if (typeof val == "string" && !isNaN(parseInt(val))) return parseInt(val);
  return null;
}
export default function InputHolder() {
  const router = useRouter();
  const routeNavigate = router.push;
  const { register, handleSubmit, setValue, formState } = useForm<DataFrom>();

  useEffect(() => {
    if (router.asPath.startsWith("/search")) {
      const regex = /\/search\/(.+)/;
      const match = window.location.pathname.match(regex);
      if (!match) return;
      setValue("search", decodeURIComponent(match[1]));
    } else {
      const [, path, id] = window.location.pathname.split("/");
      const params = Object.fromEntries(
        new URLSearchParams(window.location.search).entries()
      );
      if (path)
        predictInputStr(path, {
          id,
          ...params,
        }).then((str) => {
          if (str) setValue("search", str);
        });
    }
  }, []);
  useEffect(() => {
    async function analyzeUrl(value: string) {
      setValue("search", value);
      if (window.Environment == "desktop") {
        const dest = await window.api.invoke("navigate", value);
        if (dest) routeNavigate(dest);
      }
      if (window.Environment == "web") {
        const dest = navigate(value);
        if (dest) routeNavigate(dest);
      }
    }
    if (window.Environment == "desktop") {
      window.api.on("getInputUrl", async (_, url) => {
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
        onSubmit={handleSubmit(async (data) => {
          if (window.Environment == "desktop") {
            const dest = await window.api.invoke("navigate", data.search);
            if (dest) return routeNavigate(dest);
          }
          if (window.Environment == "web") {
            const dest = navigate(data.search);
            if (dest) return routeNavigate(dest);
          }
          return routeNavigate(`/search/${encodeURIComponent(data.search)}`);
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
                async onChange(e: ChangeEvent<HTMLInputElement>) {
                  const value = e.currentTarget.value;
                  if (window.Environment == "desktop") {
                    const dest = await window.api.invoke("navigate", value);
                    if (dest) routeNavigate(dest);
                  }
                  if (window.Environment == "web") {
                    const dest = navigate(value);
                    if (dest) routeNavigate(dest);
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
