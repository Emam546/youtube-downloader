import { app } from "electron";

// Use app directly instead of electron-toolkit utils to avoid timing issues
// Defer the check to ensure app is ready
export const isProd = () =>
  app.isPackaged || process.env.NODE_ENV == "production";
export const isDev = () =>
  process.env.NODE_ENV == "development" && !app.isPackaged;



