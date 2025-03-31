import { getTime, isValidUrl } from "../utils";
import { v4 } from "uuid";
export const PATH = "link";
export function navigate(str: string): string | null {
  if (isValidUrl(str)) return `/${PATH}/${v4()}?link=${encodeURI(str)}`;
  return null;
}
export function predictInputString(query: any): string {
  const { link } = query as {
    link: string;
  };
  return decodeURI(link);
}
