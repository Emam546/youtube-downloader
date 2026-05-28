"use strict";
(() => {
  // extension/src/background.ts
  function openDownloaderForUrl(rawUrl) {
    if (!rawUrl) return;
    const encodedUrl = encodeURIComponent(`link="${rawUrl}"`);
    const deepLink = `youtube-downloader://${encodedUrl}`;
    chrome.tabs.create({ url: deepLink });
  }
  chrome.action.onClicked.addListener(async (tab) => {
    openDownloaderForUrl(tab?.url);
  });
  chrome.runtime.onMessage.addListener((message) => {
    if (!message || message.type !== "OPEN_DOWNLOADER") return;
    openDownloaderForUrl(message.url);
  });
})();
