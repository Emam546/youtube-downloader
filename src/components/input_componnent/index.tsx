import { useRouter } from "next/router";
import { validateURL, getVideoID } from "@src/utils";
import Link from "next/link";

export default function InputHolder() {
    const navigate = useRouter().push;

    return (
        <form
            action=""
            method="POST"
            className="text-center tw-px-2 sm:tw-px-10  tw-py-10 main-form"
            autoComplete="off"
            onSubmit={(event) => {
                event.preventDefault();
                const data = new FormData(event.currentTarget);
                const video = data.get("video");
                if (typeof video != "string") return;
                if (validateURL(video))
                    return navigate(`/youtube/${getVideoID(video)}`);
                else return navigate(`/search/${video}`);
            }}
        >
            <h2 className="tw-font-medium">
                Download Video and Audio from YouTube
            </h2>
            <div className="input-container">
                <div className="tw-flex-grow position-relative">
                    <input
                        type="text"
                        name="video"
                        id="id"
                    />
                </div>
                <button
                    type="submit"
                    className="tw-p-4"
                >
                    <span className="">Start</span>
                    <i className="fa-solid fa-arrow-right m-2"></i>
                </button>
            </div>
            <p className="terms tw-text-xs tw-p-2">
                By using our service you are accepting our
                <Link href="/terms-of-service">Terms of Use.</Link>
            </p>
        </form>
    );
}
