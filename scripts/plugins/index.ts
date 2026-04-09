import { NavigateData, RelatedData, ResponseData } from "../types/types";
import { DownloadBase, DownloadParams } from "../utils/Bases";

export interface DataType {
  apps: Record<string, number>;
  version: string;
  appVersion: string;
}
interface Data {}
export interface PluginType {
  PATH: string;
  getData: <T>(query: Record<string, any>) => Promise<ResponseData<T> | null>;
  navigate: (val: string) => Promise<NavigateData | null> | NavigateData | null;
  search?: (val: string) => RelatedData[];
  predictInputString: (val: Record<string, any>) => string;
  download: <T>(data: DownloadParams<T>) => DownloadBase;
}
