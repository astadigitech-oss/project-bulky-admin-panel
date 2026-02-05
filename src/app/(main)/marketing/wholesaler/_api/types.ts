import { BaseParams, BaseResponse } from "@/lib/types";

// types
// ------partials------
export type WholesalerMarketingConfigType = {
  daftar_email: string[];
  id: string;
  updated_at: string;
};

export type WholesalerMarketingAnggaranType = {
  id: string;
  label: string;
  urutan: number;
};

// ------query------
export type WholesalerMarketingConfigResponse = BaseResponse & {
  data: WholesalerMarketingConfigType;
};

export type WholesalerMarketingAnggaranResponse = BaseResponse & {
  data: WholesalerMarketingAnggaranType[];
};

// ------mutation------
export type UpdateWholesalerMarketingConfigBody = { daftar_email: string[] };

export type UpdateWholesalerMarketingConfigResponse = BaseResponse & {
  data: WholesalerMarketingConfigType;
};

export type CreateWholesalerMarketingAnggaranBody = { label: string };

export type CreateWholesalerMarketingAnggaranResponse = BaseResponse & {
  data: WholesalerMarketingAnggaranType;
};

export type UpdateWholesalerMarketingAnggaranParams = BaseParams;

export type UpdateWholesalerMarketingAnggaranBody = { label: string };

export type UpdateWholesalerMarketingAnggaranResponse = BaseResponse & {
  data: WholesalerMarketingAnggaranType;
};

export type ReorderWholesalerMarketingAnggaranParams = BaseParams;

export type ReorderWholesalerMarketingAnggaranBody = {
  direction: "up" | "down";
};

export type ReorderWholesalerMarketingAnggaranResponse = BaseResponse & {
  data: {
    item: { id: string; urutan: number };
    swapped_with: { id: string; urutan: number };
  };
};

export type DeleteWholesalerMarketingAnggaranParams = BaseParams;

export type DeleteWholesalerMarketingAnggaranResponse = BaseResponse;
