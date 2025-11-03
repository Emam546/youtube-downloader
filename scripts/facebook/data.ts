import { getData as getDataOrg } from "../ytdlp/data";
export async function getData(query: { id: string }) {
  return getDataOrg({ link: `https://www.facebook.com/watch?v=${query.id}` });
}
