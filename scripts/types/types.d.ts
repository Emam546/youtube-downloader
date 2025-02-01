export interface Media {
  dlink: string | { video: string; audio: string };
  previewLink: string;
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

export interface ResponseData {
  video?: {
    medias: Partial<Record<TabsType, Media[]>>;
    title: string;
    thumbnail: string;
    start?: number;
    end?: number;
    duration: number;
    viewerUrl: string;
  };
  relatedData?: RelatedData[];
}
