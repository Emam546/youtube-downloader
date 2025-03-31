import Plugins from "./plugins";

export function predictInputString(path: string, query: any) {
  return Plugins.find((val) => val.PATH == path)!.predictInputString(query);
}
