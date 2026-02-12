import {
  BaseListParams,
  BaseParams,
  BaseResponse,
  DuoLangType,
  MetaPagination,
} from "@/lib/types";

// types
// ------partials------
export type PromoPartIType = {
  gambar_url: DuoLangType;
  id: string;
  is_visible: boolean;
  tujuan: string[];
  nama: string;
  updated_at: string;
  urutan: number;
};
export type PromoPartIIType = {
  created_at: string;
  tanggal_mulai: string;
  tanggal_selesai: string;
};

export type PromoListRequest = BaseListParams;

export type PromoDetailRequest = BaseParams;

// ------query------
export type PromoListResponse = BaseResponse & {
  data: PromoPartIType[];
  meta: MetaPagination;
};

export type PromoDetailResponse = BaseResponse & {
  data: PromoPartIType & PromoPartIIType;
};

// ------mutation------
export type CreatePromoBody = FormData;

export type CreatePromoResponse = BaseResponse & {
  data: PromoPartIType & PromoPartIIType;
};

export type UpdatePromoParams = BaseParams;

export type UpdatePromoBody = FormData;

export type UpdatePromoResponse = BaseResponse & {
  data: PromoPartIType & PromoPartIIType;
};

export type DeletePromoParams = BaseParams;

export type DeletePromoResponse = BaseResponse;

export type ChangeStatusPromoParams = BaseParams;

export type ChangeStatusPromoResponse = BaseResponse & {
  data: { id: string; is_active: boolean };
};

export type ReorderPromoParams = BaseParams;

export type ReorderPromoBody = { direction: "up" | "down" };

export type ReorderPromoResponse = BaseResponse & {
  data: {
    item: { id: string; urutan: number };
    swapped_with: { id: string; urutan: number };
  };
};
