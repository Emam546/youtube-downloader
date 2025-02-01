import Plugins from "./plugins";

export function getVideoData(path: string, query: any) {
  return Plugins.find((val) => val.PATH == path)!.getData(query);
}
