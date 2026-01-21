import {
  BaseListParams,
  BaseParams,
  BaseResponse,
  DuoLangType,
  MetaPagination,
} from "@/lib/types";

// types
// ------partials------
export type CategoryPartIType = {
  icon_url: string;
  id: string;
  is_active: boolean;
  nama: DuoLangType;
  updated_at: string;
};
export type CategoryPartIIType = {
  slug: string;
  deskripsi: string;
  teks_kondisi: string;
  gambar_kondisi_url: string;
  created_at: string;
  tipe_kondisi_tambahan?: "TEKS" | "GAMBAR";
};

export type CategoryListRequest = BaseListParams;

export type CategoryDetailRequest = BaseParams;

// ------query------
export type CategoryListResponse = BaseResponse & {
  data: CategoryPartIType[];
  meta: MetaPagination;
};

export type CategoryDetailResponse = BaseResponse & {
  data: CategoryPartIType & CategoryPartIIType;
};

// ------mutation------
export type CreateCategoryBody = FormData;

export type CreateCategoryResponse = BaseResponse & {
  data: CategoryPartIType & CategoryPartIIType;
};

export type UpdateCategoryParams = BaseParams;

export type UpdateCategoryBody = FormData;

export type UpdateCategoryResponse = BaseResponse & {
  data: CategoryPartIType & CategoryPartIIType;
};

export type DeleteCategoryParams = BaseParams;

export type DeleteCategoryResponse = BaseResponse;

export type ChangeStatusCategoryParams = BaseParams;

export type ChangeStatusCategoryResponse = BaseResponse & {
  data: { id: string; is_active: boolean };
};
