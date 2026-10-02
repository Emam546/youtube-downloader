/* eslint-disable no-console */
import { logger } from "@app/main/helpers/logger";
import { exec } from "child_process";
import path from "path";
import { app } from "electron";
export function OpenFile(filePath: string) {
  return new Promise((res, rej) => {
    let command: string;
    switch (process.platform) {
      case "win32":
        command = `start "" "${filePath}"`;
        break;
      case "darwin":
        command = `open "${filePath}"`;
        break;
      case "linux":
        command = `xdg-open "${filePath}"`;
        break;
      default:
        throw new Error(`Unsupported platform: ${process.platform}`);
    }

    exec(command, (err) => {
      if (err) return rej(err);
      res(true);
    });
  });
}
export function OpenFileWith(filePath: string) {
  return new Promise((res, rej) => {
    let command: string;
    switch (process.platform) {
      case "win32":
        command = `openwith "${filePath}"`;
        break;
      default:
        throw new Error(`Unsupported platform: ${process.platform}`);
    }

    exec(command, (err) => {
      if (err) return rej(err);
      res(true);
    });
  });
}
export function OpenFolder(filePath: string) {
  return new Promise((res, ) => {
    let command: string;
    switch (process.platform) {
      case "win32":
        command = `explorer "${filePath}"`;
        break;
      default:
        throw new Error(`Unsupported platform: ${process.platform}`);
    }
    exec(command, () => {
      res(true);
    });
  });
}

export function OpenFolderSelected(filePath: string) {
  return new Promise((res, rej) => {
    let command: string;

    switch (process.platform) {
      case "win32":
        // normalize path for Windows
        const fullPath = path.resolve(filePath);
        command = `explorer /select,"${fullPath}"`;
        break;

      default:
        return rej(new Error(`Unsupported platform: ${process.platform}`));
    }

    exec(command, (err) => {
      if (err) return rej(err);
      res(true);
    });
  });
}

export function ShutDown(force: boolean, time = 0) {
  exec(
    `shutdown /s ${force ? "/f" : ""} /t ${time}`,
    (error, stdout, stderr) => {
      if (error) {
        logger.err(`Error: ${error.message}`);
        return;
      }
      if (stderr) {
        logger.err(`Stderr: ${stderr}`);
        return;
      }
      logger.info(`Stdout: ${stdout}`);
    },
  );
}
export function SleepComputer() {
  exec(
    `rundll32.exe powrprof.dll, SetSuspendState Sleep`,
    (error, stdout, stderr) => {
      if (error) {
        logger.err(`Error: ${error.message}`);
        return;
      }
      if (stderr) {
        logger.err(`Stderr: ${stderr}`);
        return;
      }
      logger.info(`Stdout: ${stdout}`);
    },
  );
}

export function getExtensionPath(): string {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, "browser-extension");
  } else {
    return path.join(process.cwd(), "resources", "browser-extension", "chrome-built");
  }
}

export function openBrowserExtensionsPage(browser = "chrome") {
  return new Promise((res, rej) => {
    let url;
    switch (browser.toLowerCase()) {
      case "chrome":
        url = "chrome://extensions/";
        break;
      case "edge":
        url = "edge://extensions/";
        break;
      case "brave":
        url = "brave://extensions/";
        break;
      default:
        return rej(new Error(`Unsupported browser: ${browser}`));
    }

    let command;
    switch (process.platform) {
      case "win32":
        command = `start "" "${url}"`;
        break;
      case "darwin":
        command = `open "${url}"`;
        break;
      case "linux":
        command = `xdg-open "${url}"`;
        break;
      default:
        return rej(new Error(`Unsupported platform: ${process.platform}`));
    }

    exec(command, (err) => {
      if (err) return rej(err);
      res(true);
    });
  });
}
