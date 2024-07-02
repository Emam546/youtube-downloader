import { createMainWindow } from "./helpers/create-window/main";
import { app } from "electron";
import { createProgressBarWindow } from "./helpers/create-window/progress-bar";
const isProd = app.isPackaged;

if (!isProd) {
    app.setPath("userData", `${app.getPath("userData")} (development)`);
}

app.whenReady().then(async () => {
    createProgressBarWindow({
        preloadData: {
            link: "http://localhost:3001/example.mov",
            status: "connecting",
            title: "title",
        },
        stateData: {
            path: "example.mov",
            continued: false,
        },
    });
    createMainWindow({
        width: 1000,
        height: 600,
    });
});
app.on("window-all-closed", () => {
    app.quit();
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});
