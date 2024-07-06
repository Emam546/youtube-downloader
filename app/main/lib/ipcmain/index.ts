import { exec } from "child_process";
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
    return new Promise((res, rej) => {
        let command: string;
        switch (process.platform) {
            case "win32":
                command = `explorer "${filePath}"`;
                break;
            default:
                throw new Error(`Unsupported platform: ${process.platform}`);
        }
        exec(command, (err) => {
            res(true);
        });
    });
}
