import { app } from "electron";
import fs from "fs-extra";
import path from "path";
import { DownloadHistoryItem, DownloadHistoryState } from "./types";

const HISTORY_VERSION = 1;
const HISTORY_FILE_NAME = "download-history.json";

export class DownloadHistoryStorage {
  private historyPath: string;
  private state: DownloadHistoryState;

  constructor() {
    const userDataPath = app.getPath("userData");
    this.historyPath = path.join(userDataPath, HISTORY_FILE_NAME);
    this.state = this.load();
  }

  private load(): DownloadHistoryState {
    try {
      if (fs.existsSync(this.historyPath)) {
        const data = fs.readJsonSync(this.historyPath);
        // Validate and migrate if needed
        if (data.version === HISTORY_VERSION && Array.isArray(data.items)) {
          return data;
        }
      }
    } catch (error) {
      console.error("Failed to load download history:", error);
    }
    // Return default state if file doesn't exist or is invalid
    return { items: [], version: HISTORY_VERSION };
  }

  private save(): void {
    try {
      fs.writeJsonSync(this.historyPath, this.state, { spaces: 2 });
    } catch (error) {
      console.error("Failed to save download history:", error);
    }
  }

  getAll(): DownloadHistoryItem[] {
    return [...this.state.items];
  }

  getById(id: string): DownloadHistoryItem | undefined {
    return this.state.items.find((item) => item.id === id);
  }

  add(item: DownloadHistoryItem): void {
    // Check for duplicates by URL
    const existingIndex = this.state.items.findIndex(
      (i) =>
        i.url === item.url &&
        i.status !== "completed" &&
        i.status !== "cancelled",
    );

    if (existingIndex >= 0) {
      // Replace existing incomplete download
      this.state.items[existingIndex] = item;
    } else {
      this.state.items.unshift(item);
    }

    this.save();
  }

  update(id: string, updates: Partial<DownloadHistoryItem>): void {
    const index = this.state.items.findIndex((item) => item.id === id);
    if (index >= 0) {
      this.state.items[index] = { ...this.state.items[index], ...updates };
      this.save();
    }
  }

  remove(id: string): void {
    this.state.items = this.state.items.filter((item) => item.id !== id);
    this.save();
  }

  clear(): void {
    this.state.items = [];
    this.save();
  }

  clearCompleted(): void {
    this.state.items = this.state.items.filter(
      (item) => item.status !== "completed",
    );
    this.save();
  }

  clearFailed(): void {
    this.state.items = this.state.items.filter(
      (item) => item.status !== "failed",
    );
    this.save();
  }

  getActiveDownloads(): DownloadHistoryItem[] {
    return this.state.items.filter(
      (item) =>
        item.status === "downloading" ||
        item.status === "connecting" ||
        item.status === "preparing" ||
        item.status === "queued",
    );
  }

  // Check for interrupted downloads on app startup
  checkInterruptedDownloads(): DownloadHistoryItem[] {
    const interrupted: DownloadHistoryItem[] = [];

    this.state.items.forEach((item) => {
      const isActive =
        item.status === "downloading" ||
        item.status === "connecting" ||
        item.status === "preparing" ||
        item.status === "queued";

      // If download was active and window ID is not found, it was interrupted
      if (isActive && item.windowId) {
        item.status = "interrupted";
        item.isPaused = true;
        item.windowId = undefined;
        interrupted.push(item);
      }
    });

    if (interrupted.length > 0) {
      this.save();
    }

    return interrupted;
  }

  // Check if downloaded file still exists
  async verifyFileExists(item: DownloadHistoryItem): Promise<boolean> {
    if (!item.filePath) return false;
    try {
      await fs.access(item.filePath);
      return true;
    } catch {
      return false;
    }
  }
}

// Singleton instance
let storageInstance: DownloadHistoryStorage | null = null;

export function getHistoryStorage(): DownloadHistoryStorage {
  if (!storageInstance) {
    storageInstance = new DownloadHistoryStorage();
  }
  return storageInstance;
}
