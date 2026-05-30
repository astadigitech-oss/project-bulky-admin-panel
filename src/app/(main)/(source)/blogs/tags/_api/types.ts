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
  is_active?: boolean;
  nama?: DuoLangType | string;
  nama_id: string;
  nama_en: string;
  urutan: number;
  updated_at: string;
};

export type TagBlogPartIType = {
  created_at: string;
  slug: string;
  slug_id: string;
  slug_en: string | null;
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
  data: {
    id: string;
    nama: DuoLangType | string;
    slug_id?: string;
    slug_en?: string | null;
  }[];
};

// ------mutation------
export type CreateTagBlogBody = {
  nama_en: string;
  nama_id: string;
  slug_id?: string;
  slug_en?: string;
};

export type CreateTagBlogResponse = BaseResponse & {
  data: TagBlogType & TagBlogPartIType;
};

export type UpdateTagBlogParams = BaseParams;

export type UpdateTagBlogBody = {
  nama_en: string;
  nama_id: string;
  slug_id?: string;
  slug_en?: string;
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
    swapped: { id: string; urutan: number };
  };
};
