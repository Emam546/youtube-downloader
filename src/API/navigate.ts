import { navigate as youtubeNavigate } from "@scripts/youtube/valid";
const Plugins = [youtubeNavigate];
export function navigate(input: string): string | null {
  return Plugins.find((val) => val(input) != null)?.(input) || null;
}
