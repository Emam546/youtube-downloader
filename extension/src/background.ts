declare const chrome: any;

function openDownloaderForUrl(rawUrl?: string): void {
  if (!rawUrl) return;
  const encodedUrl = encodeURIComponent(`link="${rawUrl}"`);
  const deepLink = `youtube-downloader://${encodedUrl}`;
  chrome.tabs.create({ url: deepLink });
}

chrome.action.onClicked.addListener(async (tab: { url?: string }) => {
  openDownloaderForUrl(tab?.url);
});

chrome.runtime.onMessage.addListener((message: { type?: string; url?: string }) => {
  if (!message || message.type !== "OPEN_DOWNLOADER") return;
  openDownloaderForUrl(message.url);
});
