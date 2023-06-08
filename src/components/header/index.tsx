import { useContext, useState } from "react";
import { UserContext } from "@src/context/info";

export default function Header() {
    const { siteName } = useContext(UserContext);
    return (
        <nav className="navbar navbar-expand-lg bg-light overflow-hidden">
            <div className="container">
                <a
                    className="navbar-brand"
                    href="#"
                >
                    <img
                        src="/images/logo.png"
                        className="tw-w-12 d-inline-block tw-mr-2 align-text-center"
                        alt="logo"
                    />
                    <span className="tw-font-bold">{siteName}</span>
                </a>
                <button
                    className="navbar-toggler tw-border-4"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarSupportedContent"
                    aria-controls="navbarSupportedContent"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div
                    className="collapse navbar-collapse"
                    id="navbarSupportedContent"
                >
                    <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
                        <li className="nav-item hover:tw-bg-black/10">
                            <a
                                className="nav-link p-2 p-lg-4"
                                aria-current="page"
                                href="#"
                            >
                                YouTube Downloader
                            </a>
                        </li>
                        <li className="nav-item hover:tw-bg-black/10">
                            <a
                                className="nav-link p-2 p-lg-4"
                                aria-current="page"
                                href="#"
                            >
                                YouTube Converter
                            </a>
                        </li>
                        <li className="nav-item hover:tw-bg-black/10">
                            <a
                                className="nav-link p-2 p-lg-4"
                                aria-current="page"
                                href="#"
                            >
                                YouTube to MP3English
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
}
