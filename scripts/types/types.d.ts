import { VideoDataInfoType } from "@utils/server";
export type Envs = "web" | "desktop";
export interface Media<T> {
  environment: Envs[];
  previewLink: string;
  data: VideoDataInfoType<T>;
  container: string;
  size?: number;
  text: {
    str: string;
    label?: {
      color?: string;
      str: string;
    };
  };
  quality: number;
  id: string;
}
export type ReturnedSearch = {
  id: string;
  thumbnail: string;
  link: string;
  title: string[];
  duration?: number;
};
interface RelatedData {
  id: string;
  title: string;
  data: ReturnedSearch[];
}
type TabsType = "VIDEO" | "AUDIO" | "OTHERS";

export interface ResponseData<T> {
  video: {
    medias: Partial<Record<TabsType, Media<T>[]>>;
    title: string;
    thumbnail?: string;
    start?: number;
    end?: number;
    duration?: number;
    viewerUrl: string;
  };
  relatedData?: RelatedData[];
}
export type SearchData = RelatedData[];
