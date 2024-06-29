import { isElectron } from "@utils/electron";
declare global {
    interface Window {
        Environment: "web" | "desktop";
    }
}
if (typeof window != "undefined") {
    window.Environment = isElectron() ? "desktop" : "web";
}
