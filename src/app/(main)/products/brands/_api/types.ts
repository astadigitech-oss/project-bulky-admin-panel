import {
  BaseListParams,
  BaseParams,
  BaseResponse,
  DuoLangType,
  MetaPagination,
} from "@/lib/types";

// types
// ------partials------
export type BrandType = {
  created_at: string;
  id: string;
  nama: DuoLangType;
  is_active: boolean;
  logo_url: string;
  slug: string;
  updated_at: string;
};

export type BrandListRequest = BaseListParams;

export type BrandDetailRequest = BaseParams;

// ------query------
export type BrandListResponse = BaseResponse & {
  data: BrandType[];
  meta: MetaPagination;
};

export type BrandDetailResponse = BaseResponse & { data: BrandType };
export type BrandSelectResponse = BaseResponse & {
  data: { id: string; nama: string }[];
};

// ------mutation------
export type CreateBrandBody = FormData;

export type CreateBrandResponse = BaseResponse & { data: BrandType };

export type UpdateBrandParams = BaseParams;

export type UpdateBrandBody = FormData;

export type UpdateBrandResponse = BaseResponse & { data: BrandType };

export type DeleteBrandParams = BaseParams;

export type DeleteBrandResponse = BaseResponse;

export type ChangeStatusBrandParams = BaseParams;

export type ChangeStatusBrandResponse = BaseResponse & {
  data: { id: string; is_active: boolean };
};
