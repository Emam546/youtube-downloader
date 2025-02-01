import Plugins from "./plugins";

export function navigate(input: string): string | null {
  return (
    Plugins.find((val) => val.navigate(input) != null)?.navigate(input) || null
  );
}
