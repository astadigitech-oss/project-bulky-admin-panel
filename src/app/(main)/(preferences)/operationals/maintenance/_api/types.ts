import {
  BaseListParams,
  BaseParams,
  BaseResponse,
  MetaPagination,
} from "@/lib/types";

// types
// ------partials------
export type TypeMaintenanceEnum = "BIG_UPDATE" | "BUG" | "ERROR" | "OTHER";
export type MaintenanceType = {
  created_at: string;
  id: string;
  is_active: boolean;
  judul: string;
  tipe_maintenance: TypeMaintenanceEnum;
};
export type MaintenancePartType = {
  deskripsi: string;
  updated_at: string;
};

export type MaintenanceListRequest = BaseListParams;

export type MaintenanceDetailRequest = BaseParams;

// ------query------
export type MaintenanceListResponse = BaseResponse & {
  data: MaintenanceType[];
  meta: MetaPagination;
};

export type MaintenanceDetailResponse = BaseResponse & {
  data: MaintenanceType & MaintenancePartType;
};

// ------mutation------
export type CreateMaintenanceBody = {
  judul: string;
  tipe_maintenance: TypeMaintenanceEnum;
  deskripsi: string;
};

export type CreateMaintenanceResponse = BaseResponse & {
  data: MaintenanceType & MaintenancePartType;
};

export type UpdateMaintenanceParams = BaseParams;

export type UpdateMaintenanceBody = {
  judul: string;
  tipe_maintenance: TypeMaintenanceEnum;
  deskripsi: string;
};

export type UpdateMaintenanceResponse = BaseResponse & {
  data: MaintenanceType & MaintenancePartType;
};

export type DeleteMaintenanceParams = BaseParams;

export type DeleteMaintenanceResponse = BaseResponse;

export type ChangeStatusMaintenanceParams = BaseParams;

export type ChangeStatusMaintenanceResponse = BaseResponse;
