import { defineConfig, externalizeDepsPlugin } from "electron-vite";
import { resolve } from "path";
import react from "@vitejs/plugin-react";

export default defineConfig({
    main: {
        plugins: [externalizeDepsPlugin()],
        build: {
            rollupOptions: {
                input: {
                    index: resolve(__dirname, "app/main/index.ts"),
                },
            },
        },
        resolve: {
            alias: {
                "@shared": resolve("shared"),
                "@app": resolve("./app"),
                "@serv": resolve("./server/src"),
                "@utils": resolve("./utils"),
                "@shared/renderer/*": resolve("./app/renderer/shared"),
                "@serv/*": resolve("./server/src"),
                "@utils/*": resolve("./utils"),
            },
        },
    },
    preload: {
        plugins: [externalizeDepsPlugin()],
        build: {
            rollupOptions: {
                input: {
                    main: resolve(__dirname, "./app/preload/main.ts"),
                    progress: resolve(__dirname, "./app/preload/progress.ts"),
                },
            },
        },
        resolve: {
            alias: {
                "@shared": resolve("shared"),
                "@app": resolve("./app"),
                "@serv": resolve("./server/src"),
                "@utils": resolve("./utils"),
                "@shared/renderer/*": resolve("./app/renderer/shared"),
                "@serv/*": resolve("./server/src"),
                "@utils/*": resolve("./utils"),
            },
        },
    },
    renderer: {
        root: "./app/renderer",
        build: {
            outDir: "./out/windows/",
            rollupOptions: {
                input: {
                    progress: resolve(__dirname, "app/renderer/progress.html"),
                },
            },
        },
        resolve: {
            alias: {
                "@progress": resolve("./app/renderer/progress"),
                "@shared": resolve("./shared"),
                "@shared/renderer/*": resolve("./app/renderer/shared"),
                "@utils": resolve("./utils"),
            },
        },
        plugins: [react()],
    },
});
