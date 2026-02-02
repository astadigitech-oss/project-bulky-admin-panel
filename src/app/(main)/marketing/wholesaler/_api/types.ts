import { BaseResponse } from "@/lib/types";

// types
// ------partials------
export type WholesalerMarketingConfigType = {
  daftar_email: string[];
  id: string;
  updated_at: string;
};

// ------query------
export type WholesalerMarketingConfigResponse = BaseResponse & {
  data: WholesalerMarketingConfigType;
};

// ------mutation------
export type UpdateWholesalerMarketingConfigBody = { daftar_email: string[] };

export type UpdateWholesalerMarketingConfigResponse = BaseResponse & {
  data: WholesalerMarketingConfigType;
};
