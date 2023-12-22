import { useRouter } from "next/router";
import { validateURL, getVideoID, youtube_parser } from "@src/utils";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { useForm } from "react-hook-form";
import { useLayoutEffect } from "react";
import { useParams, usePathname } from "next/navigation";
interface DataFrom {
    search: string;
}
export default function InputHolder() {
    const router = useRouter();
    const navigate = router.push;
    const { register, handleSubmit, setValue, formState } = useForm<DataFrom>();
    useLayoutEffect(() => {
        if (router.asPath.startsWith("/youtube")) {
            const regex = /\/youtube\/([a-zA-Z0-9]+)/;
            const match = window.location.pathname.match(regex);
            if (!match) return;
            setValue("search", `https://www.youtube.com/watch?v=${match[1]}`);
        }
        if (router.asPath.startsWith("/search")) {
            const regex = /\/search\/([a-zA-Z0-9]+)/;
            const match = window.location.pathname.match(regex);
            if (!match) return;
            setValue("search", match[1]);
        }
    }, []);

    return (
        <form
            action=""
            method="POST"
            className="text-center tw-px-2 sm:tw-px-10  tw-py-10 main-form"
            autoComplete="off"
            onSubmit={handleSubmit((data) => {
                const video = data.search;
                if (validateURL(video))
                    return navigate(`/youtube/${youtube_parser(video)}`);
                else return navigate(`/search/${video}`);
            })}
        >
            <h2 className="tw-font-medium">
                Download Video and Audio from YouTube
            </h2>
            <div className="input-container">
                <div className="tw-flex-grow position-relative">
                    <input
                        type="text"
                        {...register("search", {
                            onChange(e) {
                                console.log(e);
                            },
                        })}
                    />
                </div>
                <button
                    type="submit"
                    disabled={formState.isSubmitting}
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
