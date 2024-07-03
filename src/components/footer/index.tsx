import { useContext } from "react";
import { UserContext } from "@src/context/info";

export default function Footer() {
    const { siteName } = useContext(UserContext);
    return (
        <footer className="text-center tw-py-10 tw-border-t tw-border-[#dcdfe4] tw-border-solid">
            <p className="my-4">
                @ 2016 - {new Date().getFullYear()} {siteName}
            </p>
            <ul className="tw-flex tw-gap-4 flex-wrap justify-content-center tw-text-sm">
                <li>
                    <a
                        href="#"
                        className="link-primary text-black text-decoration-none"
                    >
                        About{" "}
                    </a>
                </li>
                <li>
                    <a
                        href="#"
                        className="link-primary text-black text-decoration-none"
                    >
                        FAQ
                    </a>
                </li>
                <li>
                    <a
                        href="#"
                        className="link-primary text-black text-decoration-none"
                    >
                        Contact
                    </a>
                </li>
                <li>
                    <a
                        href="#"
                        className="link-primary text-black text-decoration-none"
                    >
                        Terms of services
                    </a>
                </li>
                <li>
                    <a
                        href="#"
                        className="link-primary text-black text-decoration-none"
                    >
                        {" "}
                        Privacy Policy
                    </a>
                </li>
            </ul>
        </footer>
    );
}
