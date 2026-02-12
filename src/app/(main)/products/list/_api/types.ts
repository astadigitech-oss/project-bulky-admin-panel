import { BaseListParams, BaseResponse, MetaPagination } from "@/lib/types";

export type ProductPartIType = {
  id: string;
  nama: string;
  is_active: boolean;
  gambar_utama: null | string;
};

export type ProductListRequest = BaseListParams;

export type ProductListResponse = BaseResponse & {
  data: ProductPartIType[];
  meta: MetaPagination;
};
