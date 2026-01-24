import { BaseListParams, BaseParams, BaseResponse } from "@/lib/types";

// types
// ------partials------
export type BannerTypeProductType = {
  gambar_url: string;
  id: string;
  is_active: boolean;
  nama: string;
  tipe_produk: { nama: string };
  updated_at: string;
  urutan: number;
};

export type BannerTypeProductResponseType = {
  created_at: string;
  gambar_url: string;
  id: string;
  is_active: boolean;
  nama: string;
  tipe_produk: { id: string; nama: string; slug: string };
  updated_at: string;
  urutan: number;
};

export type BannerTypeProductListRequest = BaseListParams;

export type BannerTypeProductDetailRequest = BaseParams;

// ------query------
export type BannerTypeProductListResponse = BaseResponse & {
  data: {
    container_load: BannerTypeProductType[];
    palet_load: BannerTypeProductType[];
    truck_load: BannerTypeProductType[];
  };
  meta: {
    total_by_type: {
      container_load: number;
      palet_load: number;
      truck_load: number;
    };
  };
};

export type ListTypeProductType = { id: string; nama: string; urutan: number };

export type BannerTypeProductDetailResponse = BaseResponse & {
  data: BannerTypeProductResponseType;
};
export type ListTypeProductResponse = BaseResponse & {
  data: ListTypeProductType[];
};

// ------mutation------
export type CreateBannerTypeProductBody = FormData;

export type CreateBannerTypeProductResponse = BaseResponse & {
  data: BannerTypeProductResponseType;
};

export type UpdateBannerTypeProductParams = BaseParams;

export type UpdateBannerTypeProductBody = FormData;

export type UpdateBannerTypeProductResponse = BaseResponse & {
  data: BannerTypeProductResponseType;
};

export type DeleteBannerTypeProductParams = BaseParams;

export type DeleteBannerTypeProductResponse = BaseResponse;

export type ChangeStatusBannerTypeProductParams = BaseParams;

export type ChangeStatusBannerTypeProductResponse = BaseResponse & {
  data: { id: string; is_active: boolean };
};

export type ReorderBannerTypeProductParams = BaseParams;

export type ReorderBannerTypeProductBody = { direction: "up" | "down" };

export type ReorderBannerTypeProductResponse = BaseResponse & {
  data: {
    item: { id: string; urutan: number };
    swapped_with: { id: string; urutan: number };
  };
};
