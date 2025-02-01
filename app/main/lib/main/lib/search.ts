import Plugins from "./plugins";
export async function searchData(input: string) {
  const results = await Promise.all(
    Plugins.filter((val) => val.search).map((val) => val.search!(input))
  );
  return results.reduce((acc, val) => [...acc, ...val]);
}
