import React, { useEffect, useState } from "react";
interface Props {
    defaultState: boolean;
    env: Window["Environment"];
    children: React.ReactNode;
}
export default function TypeApplication({
    defaultState,
    env,
    children,
}: Props) {
    const [disabled, setDisable] = useState(defaultState);
    useEffect(() => {
        setDisable(window.Environment != env);
    }, [disabled]);
    return (
        <>
            {typeof window != "undefined"
                ? window.Environment == env && children
                : !disabled && children}
        </>
    );
}
