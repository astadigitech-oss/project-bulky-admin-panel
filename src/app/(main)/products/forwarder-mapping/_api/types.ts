import {
  BaseListParams,
  BaseResponse,
  MetaPagination,
} from "@/lib/types";

// types
// ------partials------
export type ForwarderCityType = {
  id: string;
  kota_pattern: string;
  forwarder_city_id: number;
  forwarder_city_name: string;
  created_at: string;
  updated_at: string;
};

export type ForwarderSubdistrictType = {
  id: string;
  kecamatan_pattern: string;
  forwarder_city_id: number;
  forwarder_subdistrict_id: number;
  forwarder_subdistrict_name: string;
  created_at: string;
  updated_at: string;
};

export type SyncResult = {
  city_created: number;
  city_updated: number;
  city_total_from_api: number;
  subdistrict_created: number;
  subdistrict_updated: number;
  subdistrict_total_from_api: number;
  synced_at: string;
};

export type ForwarderCityListRequest = BaseListParams;

export type ForwarderSubdistrictListRequest = BaseListParams;

// ------query------
export type ForwarderCityListResponse = BaseResponse & {
  data: ForwarderCityType[];
  meta: MetaPagination;
};

export type ForwarderSubdistrictListResponse = BaseResponse & {
  data: ForwarderSubdistrictType[];
  meta: MetaPagination;
};

// ------mutation------
export type SyncForwarderMappingResponse = BaseResponse & {
  data: SyncResult;
};
