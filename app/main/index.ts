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
            link: "https://file-examples.com/storage/fe0e5e78596682d89b36118/2018/04/file_example_MOV_1920_2_2MB.mov",
            status: "connecting",
            title: "title",
        },
        stateData: {
            path: "example.mov",
            continued: false,
        },
    });
    // createMainWindow({
    //     width: 1000,
    //     height: 600,
    // });
});
app.on("window-all-closed", () => {
    app.quit();
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});
