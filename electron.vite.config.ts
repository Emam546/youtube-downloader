import { defineConfig, externalizeDepsPlugin } from "electron-vite";
import { resolve } from "path";
import react from "@vitejs/plugin-react";
const isDevelopment = process.env.NODE_ENV == "development";
export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    build: {
      rollupOptions: {
        input: {
          index: isDevelopment
            ? resolve(__dirname, "app/main/dev.ts")
            : resolve(__dirname, "app/main/index.ts"),
        },
      },
    },

    resolve: {
      alias: {
        "@app": resolve("./app"),
        "@serv": resolve("./server/src"),
        "@utils": resolve("./utils"),
      },
    },
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, "./app/preload/index.ts"),
        },
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
          finish: resolve(__dirname, "app/renderer/finish.html"),
          update: resolve(__dirname, "app/renderer/update.html"),
        },
      },
    },
    resolve: {
      alias: {
        "@renderer": resolve("./app/renderer"),
        "@utils": resolve("./utils"),
      },
    },
    plugins: [react()],
  },
});
