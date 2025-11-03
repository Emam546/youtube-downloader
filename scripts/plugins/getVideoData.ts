import { PluginType } from ".";

export const getVideoData = (Plugins: PluginType[]) =>
  function getVideoData(path: string, query: any) {
    return Plugins.find((val) => val.PATH == path)!.getData(query);
  };
