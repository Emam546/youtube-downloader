import { IDS, createIconImage, isFacebookPage, sendToDownloader } from "./shared";

function isVisibleVideo(video: HTMLVideoElement): boolean {
  const rect = video.getBoundingClientRect();
  if (rect.width < 80 || rect.height < 80) return false;
  const style = window.getComputedStyle(video);
  return !(style.display === "none" || style.visibility === "hidden" || Number(style.opacity) === 0);
}

function getFacebookVideoUrl(videoElement: HTMLVideoElement): string {
  const article = videoElement.closest("[role='article']");
  const scope = article || videoElement.parentElement || document;
  const selectors = [
    "a[href*='/watch/?v=']",
    "a[href*='/watch?v=']",
    "a[href*='/reel/']",
    "a[href*='/videos/']",
    "a[href*='fb.watch']",
  ];
  for (const selector of selectors) {
    const anchor = scope.querySelector<HTMLAnchorElement>(selector);
    const href = anchor?.getAttribute("href");
    if (!href) continue;
    try {
      return new URL(href, window.location.origin).toString();
    } catch (_error) {}
  }
  return window.location.href;
}

export function mountFacebookVideoButtons(): void {
  if (!isFacebookPage()) return;

  const videos = document.querySelectorAll<HTMLVideoElement>("video");
  const activeVideoIds = new Set<string>();

  videos.forEach((video) => {
    if (!isVisibleVideo(video)) return;
    const host = video.parentElement;
    if (!host) return;

    const currentId =
      video.getAttribute("data-ytd-bridge-video-id") ||
      `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
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
