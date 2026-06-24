import {
  BaseListParams,
  BaseParams,
  BaseResponse,
  DuoLangType,
  MetaPagination,
} from "@/lib/types";

// types
// ------partials------
export type PackageConditionType = {
  id: string;
  is_active: boolean;
  nama: DuoLangType;
  urutan: number;
  updated_at: string;
};

export type PackageConditionPartIType = {
  created_at: string;
  deskripsi: string | null;
  slug: string;
  slug_id?: string;
  slug_en?: string;
};

export type PackageConditionListRequest = BaseListParams;

export type PackageConditionDetailRequest = BaseParams;

// ------query------
export type PackageConditionListResponse = BaseResponse & {
  data: PackageConditionType[];
  meta: MetaPagination;
};

export type PackageConditionDetailResponse = BaseResponse & {
  data: PackageConditionType & PackageConditionPartIType;
};

export type PackageConditionSelectResponse = BaseResponse & {
  data: { id: string; nama: string }[];
};

// ------mutation------
export type CreatePackageConditionBody = {
  deskripsi: string | null;
  nama_en: string;
  nama_id: string;
};

export type CreatePackageConditionResponse = BaseResponse & {
  data: PackageConditionType & PackageConditionPartIType;
};

export type UpdatePackageConditionParams = BaseParams;

export type UpdatePackageConditionBody = {
  deskripsi: string | null;
  nama_en: string;
  nama_id: string;
};

export type UpdatePackageConditionResponse = BaseResponse & {
  data: PackageConditionType & PackageConditionPartIType;
};

export type DeletePackageConditionParams = BaseParams;

export type DeletePackageConditionResponse = BaseResponse;

export type ChangeStatusPackageConditionParams = BaseParams;

export type ChangeStatusPackageConditionResponse = BaseResponse & {
  data: { id: string; is_active: boolean };
};
export type ReorderPackageConditionParams = BaseParams;

export type ReorderPackageConditionBody = { direction: "up" | "down" };

export type ReorderPackageConditionResponse = BaseResponse & {
  data: {
    item: { id: string; urutan: number };
    swapped_with: { id: string; urutan: number };
  };
};
