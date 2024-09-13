import { redirect } from "next/navigation";
import { useRouter } from "next/router";
import { useEffect } from "react";
export default function Main() {
    const push = useRouter().push;
    useEffect(() => {
        push("/");
    });
    return <></>;
}
