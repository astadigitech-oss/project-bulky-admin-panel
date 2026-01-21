import {
  BaseListParams,
  BaseParams,
  BaseResponse,
  DuoLangType,
  MetaPagination,
} from "@/lib/types";

// types
// ------partials------
export type SourceType = {
  id: string;
  is_active: boolean;
  nama: DuoLangType;
  updated_at: string;
};

export type SourcePartIType = {
  created_at: string;
  deskripsi: string;
  slug: string;
};

export type SourceListRequest = BaseListParams;

export type SourceDetailRequest = BaseParams;

// ------query------
export type SourceListResponse = BaseResponse & {
  data: SourceType[];
  meta: MetaPagination;
};

export type SourceDetailResponse = BaseResponse & {
  data: SourceType & SourcePartIType;
};

// ------mutation------
export type CreateSourceBody = {
  deskripsi: string;
  nama_en: string;
  nama_id: string;
};

export type CreateSourceResponse = BaseResponse & {
  data: SourceType & SourcePartIType;
};

export type UpdateSourceParams = BaseParams;

export type UpdateSourceBody = {
  deskripsi: string;
  nama_en: string;
  nama_id: string;
};

export type UpdateSourceResponse = BaseResponse & {
  data: SourceType & SourcePartIType;
};

export type DeleteSourceParams = BaseParams;

export type DeleteSourceResponse = BaseResponse;

export type ChangeStatusSourceParams = BaseParams;

export type ChangeStatusSourceResponse = BaseResponse & {
  data: { id: string; is_active: boolean };
};
