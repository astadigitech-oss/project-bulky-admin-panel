import {
  BaseListParams,
  BaseParams,
  BaseResponse,
  MetaPagination,
} from "@/lib/types";

// types
// ------partials------
export type TypeForceUpdateEnum = "OPTIONAL" | "MANDATORY";
export type TypePlatformEnum = "ANDROID" | "IOS";
export type ForceUpdateType = {
  created_at: string;
  id: string;
  is_active: boolean;
  kode_versi: string;
  minimum_build_number: number;
  update_type: TypeForceUpdateEnum;
  platform: TypePlatformEnum;
};
export type ForceUpdatePartType = {
  informasi_update: string;
  informasi_update_en: string;
  updated_at: string;
};

export type ForceUpdateListRequest = BaseListParams & {
  platform?: TypePlatformEnum | "";
};

export type ForceUpdateDetailRequest = BaseParams;

// ------query------
export type ForceUpdateListResponse = BaseResponse & {
  data: ForceUpdateType[];
  meta: MetaPagination;
};

export type ForceUpdateDetailResponse = BaseResponse & {
  data: ForceUpdateType & ForceUpdatePartType;
};

// ------mutation------
export type CreateForceUpdateBody = {
  informasi_update: string;
  informasi_update_en: string;
  kode_versi: string;
  minimum_build_number: number;
  update_type: TypeForceUpdateEnum;
  platform: TypePlatformEnum;
};

export type CreateForceUpdateResponse = BaseResponse & {
  data: ForceUpdateType & ForceUpdatePartType;
};

export type UpdateForceUpdateParams = BaseParams;

export type UpdateForceUpdateBody = {
  informasi_update: string;
  informasi_update_en?: string;
  kode_versi: string;
  minimum_build_number: number;
  update_type: TypeForceUpdateEnum;
  platform?: TypePlatformEnum;
};

export type UpdateForceUpdateResponse = BaseResponse & {
  data: ForceUpdateType & ForceUpdatePartType;
};

export type DeleteForceUpdateParams = BaseParams;

export type DeleteForceUpdateResponse = BaseResponse;

export type ChangeStatusForceUpdateParams = BaseParams;

export type ChangeStatusForceUpdateResponse = BaseResponse;
