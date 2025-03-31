import fs from "fs";
import { v4 } from "uuid";
export const PATH = "local";
export function navigate(str: string): string | null {
  if (fs.existsSync(str)) return `/${PATH}/${encodeURI(str)}`;
  return null;
}
export function predictInputString(query: any): string {
  const { id } = query as {
    id: string;
  };
  return decodeURI(id);
}
