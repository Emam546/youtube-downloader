"use strict";
(() => {
  // extension/src/content-script/shared.ts
  var IDS = {
    button: "__ytd_bridge_download_button",
    container: "__ytd_bridge_download_container",
    style: "__ytd_bridge_style",
    ytThumbButton: "__ytd_bridge_thumb_button",
    fbVideoButton: "__ytd_bridge_fb_video_button"
  };
  var ICON_URL = chrome.runtime.getURL("icon.png");
  var ICON_FALLBACK = "data:image/svg+xml;utf8," + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><rect width="24" height="24" rx="6" fill="#d6133a"/><path d="M12 5v9m0 0l-3-3m3 3l3-3M6 17h12" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
  );
  function isYoutubePage() {
    const host = window.location.hostname;
    return host === "youtu.be" || host === "youtube.com" || host.endsWith(".youtube.com");
  }
  function isYoutubeWatchPage() {
    return isYoutubePage() && window.location.pathname === "/watch";
  }
  function isFacebookPage() {
    const host = window.location.hostname;
    return host === "facebook.com" || host.endsWith(".facebook.com") || host === "fb.watch";
  }
  function sendToDownloader(url) {
    chrome.runtime.sendMessage({ type: "OPEN_DOWNLOADER", url });
  }
  function createIconImage(altText) {
    const img = document.createElement("img");
    img.src = ICON_URL;
    img.alt = altText;
    img.loading = "lazy";
    img.addEventListener(
      "error",
      () => {
        img.src = ICON_FALLBACK;
      },
      { once: true }
    );
    return img;
  }
  function ensureSharedStyles() {
    if (document.getElementById(IDS.style)) return;
    const style = document.createElement("style");
    style.id = IDS.style;
    style.textContent = `
    #${IDS.container} {
      display: flex;
      align-items: center;
      z-index: 2147483647;
      position: absolute;
      top: 12px;
      left: 12px;
    }

    #${IDS.button} {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      background: linear-gradient(135deg, #ff2a55 0%, #d6133a 100%);
      color: #ffffff;
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 999px;
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
      box-shadow: 0 8px 18px rgba(214, 19, 58, 0.35);
    }

    #${IDS.button} img {
      width: 16px;
      height: 16px;
      border-radius: 4px;
    }

    #${IDS.button}.icon-only {
      width: 36px;
      height: 36px;
      padding: 0;
      justify-content: center;
    }

    #${IDS.button}.icon-only .label {
      display: none;
    }

    #${IDS.container}.yt-inline {
      position: static !important;
      margin-left: 8px;
    }

    .${IDS.ytThumbButton},
    .${IDS.fbVideoButton} {
      position: absolute;
      top: 8px;
      right: 8px;
      width: 32px;
      height: 32px;
      border: 0;
      border-radius: 999px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #ff2a55 0%, #d6133a 100%);
      box-shadow: 0 8px 18px rgba(214, 19, 58, 0.35);
      cursor: pointer;
      z-index: 2147483647 !important;
    }

    .${IDS.ytThumbButton} img,
    .${IDS.fbVideoButton} img {
      width: 16px;
      height: 16px;
    }
  `;
    document.documentElement.appendChild(style);
  }

  // extension/src/content-script/youtube.ts
  function getYoutubeUrlFromAnchor(anchor) {
    const href = anchor.getAttribute("href");
    if (!href || !href.startsWith("/watch")) return null;
    return `https://www.youtube.com${href}`;
  }
  function findYoutubeActionBar() {
    const selectors = [
      "#top-level-buttons-computed",
      "ytd-menu-renderer #top-level-buttons-computed",
      "ytd-watch-metadata #menu #top-level-buttons-computed",
      "#actions #top-level-buttons-computed",
      "ytd-watch-metadata #actions-inner"
    ];
    for (const selector of selectors) {
      const node = document.querySelector(selector);
      if (node) return node;
    }
    return null;
  }
  function createWatchButton() {
    const button = document.createElement("button");
    button.id = IDS.button;
    button.type = "button";
    button.setAttribute("aria-label", "Download this video with the app");
    button.appendChild(createIconImage("Downloader App"));
    const label = document.createElement("span");
    label.className = "label";
    label.textContent = "Download";
    button.appendChild(label);
    button.addEventListener("click", () => sendToDownloader(window.location.href));
    return button;
  }
  function mountYoutubeWatchButton() {
    if (!isYoutubeWatchPage()) return;
    const actionBar = findYoutubeActionBar();
    if (!actionBar) return;
    let container = document.getElementById(IDS.container);
    if (!container) {
      container = document.createElement("div");
      container.id = IDS.container;
      container.classList.add("yt-inline");
      container.appendChild(createWatchButton());
    }
    if (!actionBar.contains(container)) actionBar.appendChild(container);
  }
  function attachThumbButton(anchor) {
    if (anchor.querySelector(`.${IDS.ytThumbButton}`)) return;
    const videoUrl = getYoutubeUrlFromAnchor(anchor);
    if (!videoUrl) return;
    if (window.getComputedStyle(anchor).position === "static") anchor.style.position = "relative";
    const button = document.createElement("button");
    button.className = IDS.ytThumbButton;
    button.type = "button";
    button.setAttribute("aria-label", "Download this video with the app");
    button.appendChild(createIconImage("Downloader App"));
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      sendToDownloader(videoUrl);
    });
    anchor.appendChild(button);
  }
  function mountYoutubeThumbnailButtons() {
    if (!isYoutubePage()) return;
    const anchors = document.querySelectorAll(
      "a#thumbnail[href*='/watch'], a[href*='/watch?v=']"
    );
    anchors.forEach(attachThumbButton);
  }

  // extension/src/content-script/facebook.ts
  function isVisibleVideo(video) {
    const rect = video.getBoundingClientRect();
    if (rect.width < 80 || rect.height < 80) return false;
    const style = window.getComputedStyle(video);
    return !(style.display === "none" || style.visibility === "hidden" || Number(style.opacity) === 0);
  }
  function getFacebookVideoUrl(videoElement) {
    const article = videoElement.closest("[role='article']");
    const scope = article || videoElement.parentElement || document;
    const selectors = [
      "a[href*='/watch/?v=']",
      "a[href*='/watch?v=']",
      "a[href*='/reel/']",
      "a[href*='/videos/']",
      "a[href*='fb.watch']"
    ];
    for (const selector of selectors) {
      const anchor = scope.querySelector(selector);
      const href = anchor?.getAttribute("href");
      if (!href) continue;
      try {
        return new URL(href, window.location.origin).toString();
      } catch (_error) {
      }
    }
    return window.location.href;
  }
  function mountFacebookVideoButtons() {
    if (!isFacebookPage()) return;
    const videos = document.querySelectorAll("video");
    const activeVideoIds = /* @__PURE__ */ new Set();
    videos.forEach((video) => {
      if (!isVisibleVideo(video)) return;
      const host = video.parentElement;
      if (!host) return;
      const currentId = video.getAttribute("data-ytd-bridge-video-id") || `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
      video.setAttribute("data-ytd-bridge-video-id", currentId);
      activeVideoIds.add(currentId);
      if (window.getComputedStyle(host).position === "static") host.style.position = "relative";
      if (host.querySelector(`.${IDS.fbVideoButton}[data-video-id="${currentId}"]`)) return;
      const button = document.createElement("button");
      button.className = IDS.fbVideoButton;
      button.type = "button";
      button.setAttribute("data-video-id", currentId);
      button.setAttribute("aria-label", "Download this video with the app");
      button.appendChild(createIconImage("Downloader App"));
      button.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        sendToDownloader(getFacebookVideoUrl(video));
      });
      host.appendChild(button);
    });
    const staleButtons = document.querySelectorAll(`.${IDS.fbVideoButton}`);
    staleButtons.forEach((button) => {
      const videoId = button.getAttribute("data-video-id");
      if (!videoId || !activeVideoIds.has(videoId)) button.remove();
    });
  }

  // extension/src/content-script/index.ts
  function init() {
    if (!document.body) return;
    if (!isYoutubePage() && !isFacebookPage()) return;
    ensureSharedStyles();
    if (isYoutubePage()) {
      mountYoutubeWatchButton();
      mountYoutubeThumbnailButtons();
    }
    if (isFacebookPage()) {
      mountFacebookVideoButtons();
    }
  }
  var timer = null;
  var observer = new MutationObserver(() => {
    if (timer) window.clearTimeout(timer);
    timer = window.setTimeout(() => init(), 120);
  });
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
  observer.observe(document.documentElement, { childList: true, subtree: true });
})();
