import { isElectron } from "@utils/electron";
declare global {
  interface Window {
    Environment: "web" | "desktop";
    log: (...params: any[]) => void;
  }
}
if (typeof window != "undefined") {
  window.Environment = isElectron() ? "desktop" : "web";
  if (window.Environment == "desktop") {
    window.log = (...text) => window.api.send("log", text);
  } else window.log = () => {};
}
