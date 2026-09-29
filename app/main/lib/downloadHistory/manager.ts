import { DownloadHistoryStorage, getHistoryStorage } from "./storage";
import { DownloadHistoryItem, DownloadStatus } from "./types";
import { BaseDownloaderWindow } from "../progressBar/window";
import fs from "fs-extra";
import { BrowserWindow } from "electron";

export class DownloadHistoryManager {
  private storage: DownloadHistoryStorage;
  private activeDownloads: Map<string, BaseDownloaderWindow<unknown>> =
    new Map();

  constructor() {
    this.storage = getHistoryStorage();
  }

  // Initialize - check for interrupted downloads on startup
  initialize(): DownloadHistoryItem[] {
    return this.storage.checkInterruptedDownloads();
  }

  // Create a new history item when download starts
  createHistoryItem(
    url: string,
    title: string,
    thumbnail: string,
    format?: string,
    quality?: string,
    windowId?: number,
  ): DownloadHistoryItem {
    const item: DownloadHistoryItem = {
      id: this.generateId(),
      url,
      title,
      thumbnail,
      status: "queued",
      progress: 0,
      downloadedBytes: 0,
      isCompleted: false,
      isPaused: false,
      isFailed: false,
      isResumable: false, // Will be determined by downloader
      createdAt: Date.now(),
      format,
      quality,
      windowId,
    };

    this.storage.add(item);
    this.emitHistoryUpdate();
    return item;
  }

  // Update progress during download
  updateProgress(
    id: string,
    progress: number,
    downloadedBytes: number,
    totalBytes?: number,
    speed?: number,
    eta?: number,
  ): void {
    this.storage.update(id, {
      progress,
      downloadedBytes,
      totalBytes,
      downloadSpeed: speed,
      eta,
      status: progress >= 100 ? "completed" : "downloading",
      isCompleted: progress >= 100,
    });
    this.emitHistoryUpdate();
  }

  // Update status
  updateStatus(id: string, status: DownloadStatus): void {
    const updates: Partial<DownloadHistoryItem> = { status };

    switch (status) {
      case "completed":
        updates.isCompleted = true;
        updates.isPaused = false;
        updates.completedAt = Date.now();
        updates.progress = 100;
        break;
      case "paused":
        updates.isPaused = true;
        break;
      case "failed":
        updates.isFailed = true;
        updates.isPaused = false;
        break;
      case "cancelled":
        updates.isPaused = false;
        break;
      case "downloading":
      case "connecting":
      case "preparing":
        updates.isPaused = false;
        updates.isFailed = false;
        break;
    }

    this.storage.update(id, updates);
    this.emitHistoryUpdate();
  }

  // Update resumability
  updateResumability(id: string, isResumable: boolean): void {
    this.storage.update(id, { isResumable });
  }

  // Update file path when download completes
  updateFilePath(id: string, filePath: string): void {
    this.storage.update(id, { filePath });
  }

  // Set error message
  setError(id: string, error: string): void {
    this.storage.update(id, {
      error,
      status: "failed",
      isFailed: true,
      isPaused: false,
    });
  }

  // Associate window with download
  setWindowId(id: string, windowId: number): void {
    this.storage.update(id, { windowId });
  }

  // Clear window ID when download ends
  clearWindowId(id: string): void {
    this.storage.update(id, { windowId: undefined });
  }

  // Get all history items
  getAll(): DownloadHistoryItem[] {
    return this.storage.getAll();
  }

  // Get single item
  getById(id: string): DownloadHistoryItem | undefined {
    return this.storage.getById(id);
  }

  // Remove item from history
  remove(id: string): void {
    this.storage.remove(id);
  }

  // Clear all history
  clear(): void {
    this.storage.clear();
  }

  // Clear completed downloads
  clearCompleted(): void {
    this.storage.clearCompleted();
  }

  // Clear failed downloads
  clearFailed(): void {
    this.storage.clearFailed();
  }

  // Check if file exists for a completed download
  async verifyFileExists(id: string): Promise<boolean> {
    const item = this.storage.getById(id);
    if (!item) return false;
    return await this.storage.verifyFileExists(item);
  }

  // Determine if a download can be resumed
  async canResume(id: string): Promise<boolean> {
    const item = this.storage.getById(id);
    if (!item) return false;

    // Check if download was paused or interrupted
    if (!item.isPaused && item.status !== "interrupted") {
      return false;
    }

    // Check if file exists and has partial data
    if (item.filePath) {
      try {
        const exists = await fs.pathExists(item.filePath);
        if (exists) {
          const stats = await fs.stat(item.filePath);
          // File has some data but is not complete
          return stats.size > 0 && stats.size < (item.totalBytes || Infinity);
        }
      } catch {
        return false;
      }
    }

    return false;
  }

  // Track active download window
  trackDownload(id: string, window: BaseDownloaderWindow<unknown>): void {
    this.activeDownloads.set(id, window);
    this.setWindowId(id, window.id);
  }

  // Untrack download window
  untrackDownload(id: string): void {
    this.activeDownloads.delete(id);
    this.clearWindowId(id);
  }

  // Get active download window
  getActiveWindow(id: string): BaseDownloaderWindow<unknown> | undefined {
    return this.activeDownloads.get(id);
  }

  // Pause an active download
  pauseDownload(id: string): boolean {
    const window = this.activeDownloads.get(id);
    if (window) {
      window.trigger(false);
      this.updateStatus(id, "paused");
      return true;
    }
    return false;
  }

  // Resume a paused download
  resumeDownload(id: string): boolean {
    const window = this.activeDownloads.get(id);
    if (window) {
      window.trigger(true);
      this.updateStatus(id, "downloading");
      return true;
    }
    return false;
  }

  // Cancel an active download
  cancelDownload(id: string): boolean {
    const window = this.activeDownloads.get(id);
    if (window) {
      window.cancel();
      this.updateStatus(id, "cancelled");
      this.untrackDownload(id);
      return true;
    }
    return false;
  }

  private generateId(): string {
    return `dl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Emit event to notify renderer of history updates
  private emitHistoryUpdate(): void {
    // Notify all windows that history has changed
    const windows = BrowserWindow.getAllWindows();
    windows.forEach((win) => {
      if (!win.isDestroyed()) {
        win.webContents.send("downloadHistoryUpdated");
      }
    });
  }
}

// Singleton instance
let managerInstance: DownloadHistoryManager | null = null;

export function getHistoryManager(): DownloadHistoryManager {
  if (!managerInstance) {
    managerInstance = new DownloadHistoryManager();
  }
  return managerInstance;
}
