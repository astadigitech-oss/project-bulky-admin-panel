import {
  BaseListParams,
  BaseParams,
  BaseResponse,
  MetaPagination,
} from "@/lib/types";

// types
// ------partials------
export type DelivereeVehicle = {
  id: string;
  nama: string;
  id_deliveree: number;
  environment: "sandbox" | "production";
  kubikasi_max: number;
  berat_max: number;
  threshold_kubikasi: number;
  threshold_berat: number;
  cargo_length: number | null;
  cargo_width: number | null;
  cargo_height: number | null;
  is_active: boolean;
  last_synced_at: string | null;
  created_at: string;
  updated_at: string;
};

export type SyncResult = {
  environment: "sandbox" | "production";
  total_from_api: number;
  created: number;
  updated: number;
  deactivated: number;
  synced_at: string;
};

export type DelivereeVehicleListRequest = BaseListParams & {
  environment?: string;
};

export type DelivereeVehicleDetailRequest = BaseParams;

// ------query------
export type DelivereeVehicleListResponse = BaseResponse & {
  data: DelivereeVehicle[];
  meta: MetaPagination;
};

export type DelivereeVehicleDetailResponse = BaseResponse & {
  data: DelivereeVehicle;
};

// ------mutation------
export type UpdateDelivereeVehicleParams = BaseParams;

export type UpdateDelivereeVehicleBody = {
  threshold_kubikasi?: number | null;
  threshold_berat?: number | null;
  is_active?: boolean;
};

export type UpdateDelivereeVehicleResponse = BaseResponse & {
  data: DelivereeVehicle;
};

export type SyncDelivereeVehicleResponse = BaseResponse & {
  data: SyncResult;
};
