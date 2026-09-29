export type DownloadStatus =
  | "queued"
  | "preparing"
  | "connecting"
  | "downloading"
  | "paused"
  | "completed"
  | "failed"
  | "cancelled"
  | "interrupted";

export interface DownloadHistoryItem {
  id: string;
  url: string;
  title: string;
  thumbnail: string;
  status: DownloadStatus;
  progress: number; // 0-100
  downloadedBytes: number;
  totalBytes?: number;
  downloadSpeed?: number; // bytes per second
  eta?: number; // seconds remaining
  isCompleted: boolean;
  isPaused: boolean;
  isFailed: boolean;
  isResumable: boolean;
  error?: string;
  createdAt: number; // timestamp
  completedAt?: number; // timestamp
  format?: string; // e.g., "mp4", "mp3"
  quality?: string; // e.g., "1080p", "720p"
  filePath?: string;
  windowId?: number; // Electron window ID for active downloads
}

export interface DownloadHistoryState {
  items: DownloadHistoryItem[];
  version: number;
}
