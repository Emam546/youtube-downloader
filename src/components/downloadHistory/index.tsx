import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlay,
  faPause,
  faTimes,
  faTrash,
  faFolderOpen,
  faFile,
  faCopy,
  faRedo,
  faCheckCircle,
  faTimesCircle,
  faClock,
  faDownload,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import "./index.css";
import { DownloadHistoryItem } from "@src/types/api";

interface DownloadHistoryProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DownloadHistory({
  isOpen,
  onClose,
}: DownloadHistoryProps) {
  const [history, setHistory] = useState<DownloadHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadHistory();
    }
  }, [isOpen]);

  useEffect(() => {
    // Listen for history updates from main process
    if (window.Environment === "desktop") {
      const handleUpdate = () => {
        loadHistory();
      };
      window.api.on("downloadHistoryUpdated", handleUpdate);
      return () => {
        window.api.removeListener("downloadHistoryUpdated", handleUpdate);
      };
    }
  }, []);

  const loadHistory = async () => {
    setLoading(true);
    try {
      if (window.Environment === "desktop") {
        const data = await window.api.invoke("getDownloadHistory");
        setHistory(data);
      }
    } catch (error) {
      console.error("Failed to load download history:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (id: string) => {
    try {
      if (window.Environment === "desktop") {
        await window.api.invoke("removeDownloadHistoryItem", id);
        await loadHistory();
      }
    } catch (error) {
      console.error("Failed to remove item:", error);
    }
  };

  const handleClearCompleted = async () => {
    try {
      if (window.Environment === "desktop") {
        await window.api.invoke("clearCompletedDownloads");
        await loadHistory();
      }
    } catch (error) {
      console.error("Failed to clear completed:", error);
    }
  };

  const handleClearFailed = async () => {
    try {
      if (window.Environment === "desktop") {
        await window.api.invoke("clearFailedDownloads");
        await loadHistory();
      }
    } catch (error) {
      console.error("Failed to clear failed:", error);
    }
  };

  const handlePause = async (id: string) => {
    try {
      if (window.Environment === "desktop") {
        await window.api.invoke("pauseDownload", id);
        await loadHistory();
      }
    } catch (error) {
      console.error("Failed to pause download:", error);
    }
  };

  const handleResume = async (id: string) => {
    try {
      if (window.Environment === "desktop") {
        await window.api.invoke("resumeDownload", id);
        await loadHistory();
      }
    } catch (error) {
      console.error("Failed to resume download:", error);
    }
  };

  const handleCancel = async (id: string) => {
    try {
      if (window.Environment === "desktop") {
        await window.api.invoke("cancelDownload", id);
        await loadHistory();
      }
    } catch (error) {
      console.error("Failed to cancel download:", error);
    }
  };

  const handleOpenFile = async (filePath: string) => {
    try {
      if (window.Environment === "desktop") {
        await window.api.send("openFile", filePath);
      }
    } catch (error) {
      console.error("Failed to open file:", error);
    }
  };

  const handleOpenFolder = async (filePath: string) => {
    try {
      if (window.Environment === "desktop") {
        await window.api.send("openFolderSelected", filePath);
      }
    } catch (error) {
      console.error("Failed to open folder:", error);
    }
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
  };

  const getStatusIcon = (status: DownloadHistoryItem["status"]) => {
    switch (status) {
      case "completed":
        return (
          <FontAwesomeIcon icon={faCheckCircle} className="tw-text-green-500" />
        );
      case "failed":
        return (
          <FontAwesomeIcon icon={faTimesCircle} className="tw-text-red-500" />
        );
      case "paused":
        return (
          <FontAwesomeIcon icon={faPause} className="tw-text-yellow-500" />
        );
      case "downloading":
      case "connecting":
      case "preparing":
        return (
          <FontAwesomeIcon
            icon={faSpinner}
            className="tw-text-blue-500 tw-spin"
          />
        );
      case "interrupted":
        return (
          <FontAwesomeIcon icon={faClock} className="tw-text-orange-500" />
        );
      default:
        return (
          <FontAwesomeIcon icon={faDownload} className="tw-text-gray-500" />
        );
    }
  };

  const getStatusText = (status: DownloadHistoryItem["status"]) => {
    switch (status) {
      case "completed":
        return "Completed";
      case "failed":
        return "Failed";
      case "paused":
        return "Paused";
      case "downloading":
        return "Downloading";
      case "connecting":
        return "Connecting";
      case "preparing":
        return "Preparing";
      case "interrupted":
        return "Interrupted";
      case "cancelled":
        return "Cancelled";
      default:
        return "Queued";
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const formatSpeed = (bytesPerSecond?: number) => {
    if (!bytesPerSecond) return "0 B/s";
    return formatBytes(bytesPerSecond) + "/s";
  };

  const formatTime = (seconds?: number) => {
    if (!seconds) return "--:--";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  if (!isOpen) return null;

  return (
    <div className="download-history-overlay" onClick={onClose}>
      <div
        className="download-history-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="download-history-header">
          <h2>Download History</h2>
          <button className="close-button" onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <div className="download-history-actions">
          <button onClick={handleClearCompleted} className="action-button">
            Clear Completed
          </button>
          <button onClick={handleClearFailed} className="action-button">
            Clear Failed
          </button>
        </div>

        <div className="download-history-content">
          {loading ? (
            <div className="loading-state">
              <FontAwesomeIcon icon={faSpinner} className="tw-spin" />
              <span>Loading history...</span>
            </div>
          ) : history.length === 0 ? (
            <div className="empty-state">
              <FontAwesomeIcon
                icon={faDownload}
                className="tw-text-4xl tw-mb-4"
              />
              <p>No download history</p>
            </div>
          ) : (
            <div className="history-list">
              {history.map((item) => (
                <div key={item.id} className="history-item">
                  <div className="history-item-thumbnail">
                    <img
                      src={item.thumbnail || "/images/no-image.png"}
                      alt={item.title}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "/images/no-image.png";
                      }}
                    />
                  </div>

                  <div className="history-item-info">
                    <div className="history-item-title">{item.title}</div>
                    <div className="history-item-url">
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {item.url}
                      </a>
                    </div>
                    <div className="history-item-meta">
                      <span className="history-item-status">
                        {getStatusIcon(item.status)}
                        <span>{getStatusText(item.status)}</span>
                      </span>
                      {item.format && (
                        <span className="history-item-format">
                          {item.format}
                        </span>
                      )}
                      {item.quality && (
                        <span className="history-item-quality">
                          {item.quality}
                        </span>
                      )}
                    </div>
                    {item.error && (
                      <div className="history-item-error">{item.error}</div>
                    )}
                  </div>

                  <div className="history-item-progress">
                    {item.status === "downloading" ||
                    item.status === "connecting" ||
                    item.status === "preparing" ? (
                      <>
                        <div className="progress-bar">
                          <div
                            className="progress-fill"
                            style={{ width: `${item.progress}%` }}
                          />
                        </div>
                        <div className="progress-text">
                          {item.progress.toFixed(1)}% -{" "}
                          {formatBytes(item.downloadedBytes)}
                          {item.totalBytes &&
                            ` / ${formatBytes(item.totalBytes)}`}
                        </div>
                        {item.downloadSpeed && (
                          <div className="progress-speed">
                            {formatSpeed(item.downloadSpeed)}
                          </div>
                        )}
                        {item.eta && (
                          <div className="progress-eta">
                            ETA: {formatTime(item.eta)}
                          </div>
                        )}
                      </>
                    ) : item.status === "completed" ? (
                      <div className="completed-info">
                        <FontAwesomeIcon
                          icon={faCheckCircle}
                          className="tw-text-green-500"
                        />
                        <span>{formatBytes(item.downloadedBytes)}</span>
                      </div>
                    ) : item.status === "failed" ? (
                      <div className="failed-info">
                        <FontAwesomeIcon
                          icon={faTimesCircle}
                          className="tw-text-red-500"
                        />
                        <span>Failed</span>
                      </div>
                    ) : (
                      <div className="status-info">
                        <span>{formatBytes(item.downloadedBytes)}</span>
                      </div>
                    )}
                  </div>

                  <div className="history-item-actions">
                    {(item.status === "downloading" ||
                      item.status === "connecting" ||
                      item.status === "preparing") && (
                      <>
                        <button
                          onClick={() => handlePause(item.id)}
                          className="action-icon"
                          title="Pause"
                        >
                          <FontAwesomeIcon icon={faPause} />
                        </button>
                        <button
                          onClick={() => handleCancel(item.id)}
                          className="action-icon danger"
                          title="Cancel"
                        >
                          <FontAwesomeIcon icon={faTimes} />
                        </button>
                      </>
                    )}

                    {(item.status === "paused" ||
                      item.status === "interrupted") && (
                      <>
                        {item.isResumable && (
                          <button
                            onClick={() => handleResume(item.id)}
                            className="action-icon"
                            title="Resume"
                          >
                            <FontAwesomeIcon icon={faPlay} />
                          </button>
                        )}
                        <button
                          onClick={() => handleCancel(item.id)}
                          className="action-icon danger"
                          title="Cancel"
                        >
                          <FontAwesomeIcon icon={faTimes} />
                        </button>
                      </>
                    )}

                    {item.status === "failed" && (
                      <button
                        onClick={() => handleRemove(item.id)}
                        className="action-icon"
                        title="Remove"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    )}

                    {item.status === "completed" && item.filePath && (
                      <>
                        <button
                          onClick={() => handleOpenFile(item.filePath!)}
                          className="action-icon"
                          title="Open File"
                        >
                          <FontAwesomeIcon icon={faFile} />
                        </button>
                        <button
                          onClick={() => handleOpenFolder(item.filePath!)}
                          className="action-icon"
                          title="Open Folder"
                        >
                          <FontAwesomeIcon icon={faFolderOpen} />
                        </button>
                      </>
                    )}

                    <button
                      onClick={() => handleCopyUrl(item.url)}
                      className="action-icon"
                      title="Copy URL"
                    >
                      <FontAwesomeIcon icon={faCopy} />
                    </button>

                    <button
                      onClick={() => handleRemove(item.id)}
                      className="action-icon danger"
                      title="Remove from History"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>

                  <div className="history-item-date">
                    {formatDate(item.createdAt)}
                    {item.completedAt && (
                      <div className="completed-date">
                        Completed: {formatDate(item.completedAt)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
