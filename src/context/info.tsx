import { useState, createContext, ReactNode } from "react";
export type ContextType = {
    siteName: string;
};
export const UserContext = createContext({ siteName: "Youtube DownLoader" });
export function UserProvider({children}:{children:ReactNode}) {
    return (
        <UserContext.Provider value={{ siteName: "Youtube DownLoader" }}>
            {children}
        </UserContext.Provider>
    );
}
