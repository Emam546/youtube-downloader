export const PATH = "facebook";

// getFbVideoId.js
export function getFbVideoId(url: string): string | null {
  if (!url || typeof url !== "string") return null;

  // normalize
  url = url.trim();

  try {
    const u = new URL(url);
    const hostname = u.hostname.toLowerCase();

    // Only attempt for facebook URLs (helpful guard)
    if (
      !hostname.includes("facebook.com") &&
      !hostname.includes("fb.watch") &&
      !hostname.includes("fbcdn.net")
    ) {
      // allow fb.watch short links too
      return null;
    }
  } catch (e) {
    // if not a full URL, try as-is
  }

  // 1) query params: v= or story_fbid=
  try {
    const q = new URL(url).searchParams;
    if (q.has("v")) return q.get("v");
    if (q.has("story_fbid")) return q.get("story_fbid");
  } catch (e) {
    // ignore
  }

  // 2) fb.watch short links: https://fb.watch/ID/
  const fbWatch = url.match(/fb\.watch\/([A-Za-z0-9_-]+)/);
  if (fbWatch) return fbWatch[1];

  // 3) common path forms:
  // - https://www.facebook.com/{user}/videos/{id}/
  // - https://www.facebook.com/video.php?v={id}
  // - https://m.facebook.com/story.php?story_fbid={id}&id={user}
  // - https://www.facebook.com/permalink.php?story_fbid={id}&id={user}
  const pathMatch = url.match(
    /\/videos?\/([0-9]+)|\/video\.php|\/permalink\.php|\/story\.php/
  );
  if (pathMatch && pathMatch[1]) return pathMatch[1];

  // 4) fallback: try to capture the last numeric segment in the path
  const lastNum = url.match(/(?:\/|^)([0-9]{6,})(?:\/|$|\?)/);
  if (lastNum) return lastNum[1];

  // 5) some URLs embed an id after "v=" inside a string (catch more cases)
  const anyV = url.match(/[?&]v=([0-9]+)/);
  if (anyV) return anyV[1];

  return null;
}



export async function navigate(str: string): Promise<string | null> {
  const id = getFbVideoId(str);
  if (id) return `/${PATH}/${id}`;
  return null;
}
export function predictInputString(query: any): string {
  const { id } = query as {
    id: string;
  };
  return `https://www.facebook.com/share/v/${id}/`;
}
