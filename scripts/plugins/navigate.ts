import { PluginType } from ".";
import { NavigateData } from "../types/types";

export const navigate = (Plugins: PluginType[]) =>
  async function navigate(input: string): Promise<NavigateData | null> {
    for (let u = 0; u < Plugins.length; u++) {
      const element = await Plugins[u].navigate(input);
      if (element) return element;
    }
    return null;
  };
