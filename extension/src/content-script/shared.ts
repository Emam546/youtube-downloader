declare const chrome: any;

export const IDS = {
  button: "__ytd_bridge_download_button",
  container: "__ytd_bridge_download_container",
  style: "__ytd_bridge_style",
  ytThumbButton: "__ytd_bridge_thumb_button",
  fbVideoButton: "__ytd_bridge_fb_video_button",
} as const;

const ICON_URL = chrome.runtime.getURL("icon.png");
const ICON_FALLBACK =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><rect width="24" height="24" rx="6" fill="#d6133a"/><path d="M12 5v9m0 0l-3-3m3 3l3-3M6 17h12" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  );

export function isYoutubePage(): boolean {
  const host = window.location.hostname;
  return host === "youtu.be" || host === "youtube.com" || host.endsWith(".youtube.com");
}

export function isYoutubeWatchPage(): boolean {
  return isYoutubePage() && window.location.pathname === "/watch";
}

export function isFacebookPage(): boolean {
  const host = window.location.hostname;
  return host === "facebook.com" || host.endsWith(".facebook.com") || host === "fb.watch";
}

export function sendToDownloader(url: string): void {
  chrome.runtime.sendMessage({ type: "OPEN_DOWNLOADER", url });
}

export function createIconImage(altText: string): HTMLImageElement {
  const img = document.createElement("img");
  img.src = ICON_URL;
  img.alt = altText;
  img.loading = "lazy";
  img.addEventListener(
    "error",
    () => {
      img.src = ICON_FALLBACK;
    },
    { once: true },
  );
  return img;
}

export function ensureSharedStyles(): void {
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
