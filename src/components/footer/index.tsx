import { useContext } from "react";
import { UserContext } from "@src/context/info";

export default function Footer() {
    const { siteName } = useContext(UserContext);
    return (
        <footer className="tw-text-lg tw-py-10 tw-border-t tw-border-[#dcdfe4] tw-border-solid">
            <p className="tw-my-4 tw-text-center">
                @ 2016 - {new Date().getFullYear()} {siteName}
            </p>
            <ul className="tw-flex tw-gap-4 flex-wrap tw-justify-center tw-text-sm">
                <li>
                    <a
                        href="#"
                        className="hover:tw-text-primary tw-text-black tw-no-underline"
                    >
                        About
                    </a>
                </li>
                <li>
                    <a
                        href="#"
                        className="hover:tw-text-primary tw-text-black tw-no-underline"
                    >
                        FAQ
                    </a>
                </li>
                <li>
                    <a
                        href="#"
                        className="hover:tw-text-primary tw-text-black tw-no-underline"
                    >
                        Contact
                    </a>
                </li>
                <li>
                    <a
                        href="#"
                        className="hover:tw-text-primary tw-text-black tw-no-underline"
                    >
                        Terms of services
                    </a>
                </li>
                <li>
                    <a
                        href="#"
                        className="hover:tw-text-primary tw-text-black tw-no-underline"
                    >
                        Privacy Policy
                    </a>
                </li>
            </ul>
        </footer>
    );
}
