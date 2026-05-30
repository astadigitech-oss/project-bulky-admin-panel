import { BaseListParams, BaseParams, BaseResponse, MetaPagination } from "@/lib/types";

export type BlogCategoryRefType = {
  id: string;
  nama_id: string;
  nama_en: string;
  slug_id: string;
  slug_en: string | null;
};

export type BlogType = {
  id: string;
  judul_id: string;
  judul_en: string;
  slug_id: string;
  slug_en: string;
  featured_image_url: string;
  kategori: BlogCategoryRefType;
  is_active: boolean;
  view_count: number;
  published_at: string | null;
  created_at: string;
};

export type BlogDetailType = BlogType & {
  konten_id: string;
  konten_en: string;
  kategori_id: string;
  highlight_id: string;
  highlight_en: string;
  updated_at: string;
};

export type BlogListRequest = BaseListParams;
export type BlogDetailRequest = BaseParams;

export type BlogListResponse = BaseResponse & {
  data: BlogType[];
  meta: MetaPagination;
};

export type BlogDetailResponse = BaseResponse & {
  data: BlogDetailType;
};

export type CreateBlogBody = FormData;
export type CreateBlogResponse = BaseResponse & { data: BlogDetailType };

export type UpdateBlogParams = BaseParams;
export type UpdateBlogBody = FormData;
export type UpdateBlogResponse = BaseResponse & { data: BlogDetailType };

export type DeleteBlogParams = BaseParams;
export type DeleteBlogResponse = BaseResponse & { data: null };

export type ToggleStatusBlogParams = BaseParams;
export type ToggleStatusBlogResponse = BaseResponse;
