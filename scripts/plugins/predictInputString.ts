import { PluginType } from ".";

export const predictInputString = (Plugins: PluginType[]) =>
  function predictInputString(path: string, query: any) {
    return Plugins.find((val) => val.PATH == path)!.predictInputString(query);
  };
