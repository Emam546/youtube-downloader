import { PluginType } from ".";

export const searchData = (Plugins: PluginType[]) =>
  async function searchData(input: string) {
    const results = await Promise.all(
      Plugins.filter((val) => val.search).map((val) => val.search!(input))
    );
    return results.reduce((acc, val) => [...acc, ...val], []);
  };
