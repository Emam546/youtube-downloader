import { FormatResult } from "../utils/Bases/ytdlp";

export function chooseBestFormats(formats: FormatResult[]) {
  // Target qualities we want to offer
  const targetHeights = [144, 240, 360, 480, 720, 1080, 1440, 2160];

  // Remove storyboards / thumbnails / weird formats
  const valid = formats.filter(
    (f) =>
      f &&
      f.vcodec !== "none" &&
      !f.format_note?.toLowerCase().includes("storyboard") &&
      f.height &&
      f.width,
  );

  // -----------------------------
  // AUDIO
  // -----------------------------
  const audioFormats = formats.filter(
    (f) =>
      f &&
      f.acodec !== "none" &&
      f.acodec &&
      !f.format_note?.toLowerCase().includes("storyboard"),
  );

  // Prefer audio-only formats with the highest bitrate,
  // but don't blindly choose something enormous.
  const audioOnly = audioFormats.filter((f) => f.vcodec === "none");

  const bestAudio =
    [...audioOnly].sort((a, b) => {
      const abrA = a.abr || a.tbr || 0;
      const abrB = b.abr || b.tbr || 0;

      return abrB - abrA;
    })[0] || null;

  // -----------------------------
  // VIDEO QUALITY SCORE
  // -----------------------------
  function videoScore(f: FormatResult, targetHeight: number) {
    const height = f.height || 0;
    const width = f.width || 0;

    // Don't prefer video above the requested resolution.
    // A 240p request should NOT select 1080p.
    if (height > targetHeight) {
      return -Infinity;
    }

    const distance = targetHeight - height;

    // Resolution is important, but filesize matters too.
    const filesize = f.filesize || f.filesize_approx || 0;

    const fps = f.fps || 30;
    const bitrate = f.vbr || f.tbr || 0;

    let score = 0;

    // Prefer the highest resolution that doesn't exceed target
    score += height * 100;

    // Prefer wider video if resolutions are equal
    score += width;

    // Prefer reasonable FPS
    score += Math.min(fps, 60) * 2;

    // Prefer bitrate, but not excessively
    score += Math.min(bitrate, 5000) * 0.05;

    // Penalize very large files
    if (filesize > 0) {
      const sizeMB = filesize / 1024 / 1024;

      if (sizeMB > 500) {
        score -= (sizeMB - 500) * 0.1;
      }
    }

    // Small penalty for being below target
    score -= distance * 2;

    return score;
  }

  // -----------------------------
  // FIND VIDEO FOR EACH QUALITY
  // -----------------------------
  const results = [];

  for (const targetHeight of targetHeights) {
    // Video-only formats
    const videoOnly = valid.filter(
      (f) => f.height! <= targetHeight && f.vcodec !== "none",
    );

    // Formats that already contain both video + audio
    const combined = videoOnly.filter((f) => f.acodec && f.acodec !== "none");

    let selectedVideo = null;
    let selectedAudio: FormatResult | null = bestAudio;
    let mode = "video+audio";

    // First choice:
    // A combined format at the requested quality.
    if (combined.length > 0) {
      selectedVideo = [...combined].sort(
        (a, b) => videoScore(b, targetHeight) - videoScore(a, targetHeight),
      )[0];

      // Already has audio
      selectedAudio = null;
      mode = "combined";
    }

    // Otherwise use video-only + best audio
    if (!selectedVideo && videoOnly.length > 0) {
      selectedVideo = [...videoOnly].sort(
        (a, b) => videoScore(b, targetHeight) - videoScore(a, targetHeight),
      )[0];

      mode = "video+audio";
    }

    if (!selectedVideo) {
      continue;
    }

    results.push({
      quality: `${selectedVideo.height}p`,
      target: `${targetHeight}p`,
      video: selectedVideo,
      audio: selectedAudio,
      mode,
    });
  }

  return {
    audio: bestAudio,
    qualities: results,
  };
}
