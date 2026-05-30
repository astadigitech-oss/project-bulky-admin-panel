import { BaseListParams, BaseParams, BaseResponse, MetaPagination } from "@/lib/types";

export type VideoCategoryRefType = {
  id: string;
  nama_id: string;
  nama_en: string;
  slug_id: string;
  slug_en: string | null;
};

export type VideoType = {
  id: string;
  judul_id: string;
  judul_en: string;
  slug_id: string;
  slug_en: string | null;
  deskripsi_id: string;
  deskripsi_en: string;
  thumbnail_url: string;
  kategori: VideoCategoryRefType;
  is_active: boolean;
  view_count: number;
  published_at: string | null;
  created_at: string;
};

export type VideoDetailType = VideoType & {
  video_url: string;
  kategori_id: string;
  meta_title_id: string | null;
  meta_title_en: string | null;
  meta_description_id: string | null;
  meta_description_en: string | null;
  meta_keywords: string | null;
  updated_at: string;
};

export type VideoListRequest = BaseListParams;
export type VideoDetailRequest = BaseParams;

export type VideoListResponse = BaseResponse & {
  data: VideoType[];
  meta: MetaPagination;
};

export type VideoDetailResponse = BaseResponse & {
  data: VideoDetailType;
};

export type CreateVideoBody = FormData;
export type CreateVideoResponse = BaseResponse & { data: VideoDetailType };

export type UpdateVideoParams = BaseParams;
export type UpdateVideoBody = FormData;
export type UpdateVideoResponse = BaseResponse & { data: VideoDetailType };

export type DeleteVideoParams = BaseParams;
export type DeleteVideoResponse = BaseResponse & { data: null };

export type ToggleStatusVideoParams = BaseParams;
export type ToggleStatusVideoResponse = BaseResponse;
