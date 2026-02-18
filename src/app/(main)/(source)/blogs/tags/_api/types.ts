import {
  BaseListParams,
  BaseParams,
  BaseResponse,
  DuoLangType,
  MetaPagination,
} from "@/lib/types";

// types
// ------partials------
export type TagBlogType = {
  id: string;
  is_active: boolean;
  nama: DuoLangType;
  urutan: number;
  updated_at: string;
};

export type TagBlogPartIType = {
  created_at: string;
  deskripsi: string;
  slug: string;
};

export type TagBlogListRequest = BaseListParams;

export type TagBlogDetailRequest = BaseParams;

// ------query------
export type TagBlogListResponse = BaseResponse & {
  data: TagBlogType[];
  meta: MetaPagination;
};

export type TagBlogDetailResponse = BaseResponse & {
  data: TagBlogType & TagBlogPartIType;
};

export type TagBlogSelectResponse = BaseResponse & {
  data: { id: string; nama: DuoLangType }[];
};

// ------mutation------
export type CreateTagBlogBody = {
  deskripsi: string;
  nama_en: string;
  nama_id: string;
};

export type CreateTagBlogResponse = BaseResponse & {
  data: TagBlogType & TagBlogPartIType;
};

export type UpdateTagBlogParams = BaseParams;

export type UpdateTagBlogBody = {
  deskripsi: string;
  nama_en: string;
  nama_id: string;
};

export type UpdateTagBlogResponse = BaseResponse & {
  data: TagBlogType & TagBlogPartIType;
};

export type DeleteTagBlogParams = BaseParams;

export type DeleteTagBlogResponse = BaseResponse;

export type ChangeStatusTagBlogParams = BaseParams;

export type ChangeStatusTagBlogResponse = BaseResponse & {
  data: { id: string; is_active: boolean };
};
export type ReorderTagBlogParams = BaseParams;

export type ReorderTagBlogBody = { direction: "up" | "down" };

export type ReorderTagBlogResponse = BaseResponse & {
  data: {
    item: { id: string; urutan: number };
    swapped_with: { id: string; urutan: number };
  };
};
