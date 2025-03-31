export const matchLinkRegex = /^youtube-downloader:\/\//;
export const youtubeLinkRegEx = /link="([^"]+)"/;
function isVideoFile(filename: string) {
  const videoExtensions = /\.(mp4|mkv|avi|mov|wmv|flv|webm|m4v|mpeg|mpg|3gp)$/i;
  return videoExtensions.test(filename);
}
export function lunchArgs(args: string[]): string | null {
  const encodedUrl = args.find((v) => v.match(matchLinkRegex));
  if (encodedUrl) {
    const url = decodeURIComponent(encodedUrl).replace(matchLinkRegex, "");
    const link = url.match(youtubeLinkRegEx);
    if (link && link[1]) {
      return link[1];
    }
  }
  const videoFile = args.find((arg) => isVideoFile(arg));
  if (videoFile) return videoFile;

  return null;
}
