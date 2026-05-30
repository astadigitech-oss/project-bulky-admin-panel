import {
  BaseListParams,
  BaseParams,
  BaseResponse,
  DuoLangType,
  MetaPagination,
} from "@/lib/types";

export type BlogCategoryType = {
  id: string;
  nama_id: string;
  nama_en: string;
  urutan: number;
  updated_at: string;
  is_active: boolean;
};

export type BlogCategoryDetailType = BlogCategoryType & {
  slug_id: string;
  slug_en: string | null;
  created_at: string;
};

export type BlogCategorySelectItem = {
  id: string;
  nama: DuoLangType;
  slug_id: string;
  slug_en: string | null;
};

export type BlogCategoryListRequest = BaseListParams;
export type BlogCategoryDetailRequest = BaseParams;

export type BlogCategoryListResponse = BaseResponse & {
  data: BlogCategoryType[];
  meta: MetaPagination;
};

export type BlogCategoryDetailResponse = BaseResponse & {
  data: BlogCategoryDetailType;
};

export type BlogCategorySelectResponse = BaseResponse & {
  data:
    | BlogCategorySelectItem[]
    | {
        kategori?: BlogCategorySelectItem[];
        label?: {
          id: string;
          nama: DuoLangType;
          slug_id: string;
          slug_en: string | null;
        }[];
      };
};

export type CreateBlogCategoryBody = {
  nama_id: string;
  nama_en: string;
  slug_id?: string;
  slug_en?: string;
  is_active?: boolean;
};

export type CreateBlogCategoryResponse = BaseResponse & {
  data: BlogCategoryDetailType;
};

export type UpdateBlogCategoryParams = BaseParams;

export type UpdateBlogCategoryBody = {
  nama_id?: string;
  nama_en?: string;
  is_active?: boolean;
};

export type UpdateBlogCategoryResponse = BaseResponse & {
  data: BlogCategoryDetailType;
};

export type DeleteBlogCategoryParams = BaseParams;
export type DeleteBlogCategoryResponse = BaseResponse & { data: null };

export type ToggleStatusBlogCategoryParams = BaseParams;
export type ToggleStatusBlogCategoryResponse = BaseResponse;

export type ReorderBlogCategoryParams = BaseParams;
export type ReorderBlogCategoryBody = { direction: "up" | "down" };
export type ReorderBlogCategoryResponse = BaseResponse & {
  data: {
    item: { id: string; urutan: number };
    swapped: { id: string; urutan: number };
  };
};
