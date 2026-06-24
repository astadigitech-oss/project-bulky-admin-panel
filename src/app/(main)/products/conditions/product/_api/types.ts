import {
  BaseListParams,
  BaseParams,
  BaseResponse,
  DuoLangType,
  MetaPagination,
} from "@/lib/types";

// types
// ------partials------
export type ProductConditionType = {
  id: string;
  is_active: boolean;
  nama: DuoLangType;
  urutan: number;
  updated_at: string;
};

export type ProductConditionPartIType = {
  created_at: string;
  deskripsi: string | null;
  slug: string;
  slug_id?: string;
  slug_en?: string;
};

export type ProductConditionListRequest = BaseListParams;

export type ProductConditionDetailRequest = BaseParams;

// ------query------
export type ProductConditionListResponse = BaseResponse & {
  data: ProductConditionType[];
  meta: MetaPagination;
};

export type ProductConditionDetailResponse = BaseResponse & {
  data: ProductConditionType & ProductConditionPartIType;
};

export type ProductConditionSelectResponse = BaseResponse & {
  data: { id: string; nama: string }[];
};

// ------mutation------
export type CreateProductConditionBody = {
  deskripsi: string | null;
  nama_en: string;
  nama_id: string;
};

export type CreateProductConditionResponse = BaseResponse & {
  data: ProductConditionType & ProductConditionPartIType;
};

export type UpdateProductConditionParams = BaseParams;

export type UpdateProductConditionBody = {
  deskripsi: string | null;
  nama_en: string;
  nama_id: string;
};

export type UpdateProductConditionResponse = BaseResponse & {
  data: ProductConditionType & ProductConditionPartIType;
};

export type DeleteProductConditionParams = BaseParams;

export type DeleteProductConditionResponse = BaseResponse;

export type ChangeStatusProductConditionParams = BaseParams;

export type ChangeStatusProductConditionResponse = BaseResponse & {
  data: { id: string; is_active: boolean };
};
export type ReorderProductConditionParams = BaseParams;

export type ReorderProductConditionBody = { direction: "up" | "down" };

export type ReorderProductConditionResponse = BaseResponse & {
  data: {
    item: { id: string; urutan: number };
    swapped_with: { id: string; urutan: number };
  };
};
