import { IDS, createIconImage, isYoutubePage, isYoutubeWatchPage, sendToDownloader } from "./shared";

function getYoutubeUrlFromAnchor(anchor: HTMLAnchorElement): string | null {
  const href = anchor.getAttribute("href");
  if (!href || !href.startsWith("/watch")) return null;
  return `https://www.youtube.com${href}`;
}

function findYoutubeActionBar(): Element | null {
  const selectors = [
    "#top-level-buttons-computed",
    "ytd-menu-renderer #top-level-buttons-computed",
    "ytd-watch-metadata #menu #top-level-buttons-computed",
    "#actions #top-level-buttons-computed",
    "ytd-watch-metadata #actions-inner",
  ];
  for (const selector of selectors) {
    const node = document.querySelector(selector);
    if (node) return node;
  }
  return null;
}

function createWatchButton(): HTMLButtonElement {
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

export function mountYoutubeWatchButton(): void {
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

function attachThumbButton(anchor: HTMLAnchorElement): void {
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

export function mountYoutubeThumbnailButtons(): void {
  if (!isYoutubePage()) return;
  const anchors = document.querySelectorAll<HTMLAnchorElement>(
    "a#thumbnail[href*='/watch'], a[href*='/watch?v=']",
  );
  anchors.forEach(attachThumbButton);
}
