import { defineConfig, externalizeDepsPlugin } from "electron-vite";
import { resolve } from "path";
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
            },
        },
    },
    preload: {
        plugins: [externalizeDepsPlugin()],
        build: {
            rollupOptions: {
                input: {
                    index: resolve(__dirname, "app/preload/index.ts"),
                },
            },
        },
        resolve: {
            alias: {
                "@shared": resolve("shared"),
            },
        },
    },
});
