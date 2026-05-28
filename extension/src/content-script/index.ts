import { ensureSharedStyles, isFacebookPage, isYoutubePage } from "./shared";
import { mountYoutubeThumbnailButtons, mountYoutubeWatchButton } from "./youtube";
import { mountFacebookVideoButtons } from "./facebook";

function init(): void {
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

let timer: number | null = null;
const observer = new MutationObserver(() => {
  if (timer) window.clearTimeout(timer);
  timer = window.setTimeout(() => init(), 120);
});

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init, { once: true });
} else {
  init();
}

observer.observe(document.documentElement, { childList: true, subtree: true });
