import { useContext, useEffect, useState } from "react";
import { UserContext } from "@src/context/info";
import Link, { LinkProps } from "next/link";
import classNames from "classnames";
import { faBars } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
interface LiProps extends LinkProps {
    children: React.ReactNode;
}
function LiElement({ children, ...props }: LiProps) {
    return (
        <li className="tw-text-end lg:tw-text-start">
            <Link
                className="tw-h-full hover:tw-bg-black/10 tw-p-3 lg:tw-p-5 tw-flex tw-items-center tw-justify-stretch hover:tw-text-primary"
                {...props}
            >
                <span className="tw-w-full">{children}</span>
            </Link>
        </li>
    );
}
export default function Header() {
    const { siteName } = useContext(UserContext);
    const [toggle, setToggle] = useState(false);
    return (
        <nav>
            <div className="container tw-flex tw-flex-wrap tw-justify-center tw-items-stretch tw-px-0 tw-border-b tw-border-b-[#ddd]">
                <div className="tw-flex tw-justify-between tw-items-stretch tw-px-2 tw-flex-1">
                    <Link
                        className="tw-flex tw-items-center tw-gap-2 hover:tw-text-primary tw-py-2"
                        href="/"
                    >
                        <img
                            src="/images/logo.png"
                            className="tw-w-12"
                            alt="logo"
                        />
                        <span className="tw-font-bold">{siteName}</span>
                    </Link>
                    <button
                        className="tw-block tw-leading-[0] lg:tw-hidden tw-border tw-border-primary tw-text-primary tw-rounded tw-self-center tw-p-1 tw-px-1.5"
                        type="button"
                        aria-controls="navbarSupportedContent"
                        aria-expanded={toggle}
                        onClick={() => setToggle(!toggle)}
                        aria-label="Toggle navigation"
                    >
                        <FontAwesomeIcon icon={faBars} />
                    </button>
                </div>
                <div
                    className="tw-h-0 aria-expanded:tw-h-auto lg:tw-h-auto tw-w-full lg:tw-w-auto tw-overflow-hidden aria-expanded:tw-mb-2 lg:aria-expanded:tw-mb-0 lg:tw-mb-0"
                    aria-expanded={toggle}
                >
                    <ul className="tw-flex tw-flex-col lg:tw-flex-row tw-items-stretch tw-h-full tw-text-base lg:tw-text-lg">
                        <LiElement href="#">YouTube Downloader</LiElement>
                        <LiElement href="#">YouTube Converter</LiElement>
                        <LiElement href="#">YouTube to MP3English</LiElement>
                    </ul>
                </div>
            </div>
        </nav>
    );
}
