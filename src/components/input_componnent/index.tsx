import { useRouter } from "next/router";
import { validateURL, youtube_parser } from "@utils/youtube";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { useForm } from "react-hook-form";
import { ChangeEvent, useEffect } from "react";
import { NavigateVideo } from "@shared/main";
interface DataFrom {
    search: string;
}
function isVideo(val: unknown): val is NavigateVideo {
    return window.context != null && window.context.video != undefined;
}
function constructUrl(id: string | null, listId: string | null) {
    const url = new URL("https://www.youtube.com/watch");
    if (id) url.searchParams.set("v", id);
    if (listId) url.searchParams.set("list", listId);
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
function extractParams(youtubeUrl: URL): [string | null, string | null] {
    const id = youtube_parser(youtubeUrl.href);
    const list = youtubeUrl.searchParams.get("list");
    return [id || null, list];
}
function getUrl(youtubeUrl: URL) {
    const [id, list] = extractParams(youtubeUrl);
    const url = id ? appendPathToBaseUrl(baseUrl, id) : baseUrl;

    const searchParams = new URLSearchParams();
    if (list) searchParams.set("list", list);
    return `${url}?${searchParams.toString()}`;
}
function isValidUrl(string: string) {
    try {
        new URL(string);
        return true;
    } catch (err) {
        return false;
    }
}
export function CanNavigate(val: string): boolean {
    if (!isValidUrl(val)) return false;
    return extractParams(new URL(val)).some((val) => val != null);
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

            setValue(
                "search",
                constructUrl(match ? match[1] : null, list).href
            );
        }
        if (router.asPath.startsWith("/search")) {
            const regex = /\/search\/([a-zA-Z0-9]+)/;
            const match = window.location.pathname.match(regex);
            if (!match) return;
            setValue("search", match[1]);
        }
    }, []);
    useEffect(() => {
        function analyzeUrl(href: string) {
            const [id, list] = extractParams(new URL(href));
            setValue("search", constructUrl(id, list).href);
        }
        if (window.Environment == "desktop") {
            window.api.on("getYoutubeUrl", (_, url) => {
                analyzeUrl(url);
            });
            if (isVideo(window.context)) analyzeUrl(window.context.video.link);
        }
    }, []);
    return (
        <form
            action=""
            method="POST"
            className="text-center tw-px-2 sm:tw-px-10  tw-py-10 main-form"
            autoComplete="off"
            onSubmit={handleSubmit((data) => {
                const value = data.search;
                if (CanNavigate(value))
                    return navigate(getUrl(new URL(data.search)));
                else return navigate(`/search/${value}`);
            })}
        >
            <h2 className="tw-font-medium">
                Download Video and Audio from YouTube
            </h2>
            <div className="input-container">
                <div className="tw-flex-grow position-relative">
                    <input
                        type="text"
                        placeholder="Search or paste link here..."
                        {...register("search", {
                            onChange(e: ChangeEvent<HTMLInputElement>) {
                                const value = e.currentTarget.value;
                                if (CanNavigate(value))
                                    return navigate(getUrl(new URL(value)));
                            },
                        })}
                    />
                </div>
                <button
                    type="submit"
                    disabled={formState.isSubmitting}
                    title="search"
                    className="tw-p-4 tw-flex tw-items-center tw-gap-x-2"
                >
                    <span>Start</span>
                    <FontAwesomeIcon
                        icon={faArrowRight}
                        className="tw-font-bold tw-text-lg"
                    />
                </button>
            </div>
            <p className="terms tw-text-xs tw-p-2">
                By using our service you are accepting our
                <Link href="/terms-of-service">Terms of Use.</Link>
            </p>
        </form>
    );
}
