chrome.action.onClicked.addListener(async (tab) => {
  if (!tab.url) return;

  const encodedUrl = encodeURIComponent(`link="${tab.url}"`);
  const deepLink = `youtube-downloader://${encodedUrl}`;

  // This opens your Electron app
  chrome.tabs.create({ url: deepLink });
});
