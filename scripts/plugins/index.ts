import { RelatedData, ResponseData } from "../types/types";
import { DownloadBase, DownloadParams } from "../utils/Bases";



export interface DataType {
  apps: Record<string, number>;
  version: string;
  appVersion: string;
}

export interface PluginType {
  PATH: string;
  getData: <T>(query: Record<string, any>) => Promise<ResponseData<T> | null>;
  navigate: (val: string) => Promise<string | null> | string | null;
  search?: (val: string) => RelatedData[];
  predictInputString: (val: Record<string, any>) => string;
  download: <T>(data: DownloadParams<T>) => DownloadBase;
}
