import {
  BaseListParams,
  BaseParams,
  BaseResponse,
  DuoLangType,
  MetaPagination,
} from "@/lib/types";

export type VideoCategoryType = {
  id: string;
  nama_id: string;
  nama_en: string;
  urutan: number;
  updated_at: string;
  is_active?: boolean;
};

export type VideoCategoryDetailType = VideoCategoryType & {
  slug_id: string;
  slug_en: string | null;
  created_at: string;
};

export type VideoCategorySelectItem = {
  id: string;
  nama: DuoLangType;
  slug_id: string;
  slug_en: string | null;
};

export type VideoCategoryListRequest = BaseListParams;
export type VideoCategoryDetailRequest = BaseParams;

export type VideoCategoryListResponse = BaseResponse & {
  data: VideoCategoryType[];
  meta: MetaPagination;
};

export type VideoCategoryDetailResponse = BaseResponse & {
  data: VideoCategoryDetailType;
};

export type VideoCategorySelectResponse = BaseResponse & {
  data: VideoCategorySelectItem[];
};

export type CreateVideoCategoryBody = {
  nama_id: string;
  nama_en: string;
  slug_id?: string;
  slug_en?: string;
  is_active?: boolean;
};

export type CreateVideoCategoryResponse = BaseResponse & {
  data: VideoCategoryDetailType;
};

export type UpdateVideoCategoryParams = BaseParams;

export type UpdateVideoCategoryBody = {
  nama_id?: string;
  nama_en?: string;
  is_active?: boolean;
  slug_id?: string;
  slug_en?: string;
};

export type UpdateVideoCategoryResponse = BaseResponse & {
  data: VideoCategoryDetailType;
};

export type DeleteVideoCategoryParams = BaseParams;
export type DeleteVideoCategoryResponse = BaseResponse & { data: null };

export type ToggleStatusVideoCategoryParams = BaseParams;
export type ToggleStatusVideoCategoryResponse = BaseResponse;

export type ReorderVideoCategoryParams = BaseParams;
export type ReorderVideoCategoryBody = { direction: "up" | "down" };
export type ReorderVideoCategoryResponse = BaseResponse & {
  data: {
    item: { id: string; urutan: number };
    swapped: { id: string; urutan: number };
  };
};
