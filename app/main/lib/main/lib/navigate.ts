import Plugins from "./plugins";

export async function navigate(input: string): Promise<string | null> {
  for (let u = 0; u < Plugins.length; u++) {
    const element = await Plugins[u].navigate(input);
    if (element) return element;
  }
  return null;
}
