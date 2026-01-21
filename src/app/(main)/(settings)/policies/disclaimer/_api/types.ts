import {
  BaseListParams,
  BaseParams,
  BaseResponse,
  DuoLangType,
  MetaPagination,
} from "@/lib/types";

// types
// ------partials------
export type DisclaimerType = {
  id: string;
  is_active: boolean;
  judul: DuoLangType;
  updated_at: string;
};

export type DisclaimerPartIType = {
  created_at: string;
  konten: DuoLangType;
  slug: string;
};

export type DisclaimerListRequest = BaseListParams;

export type DisclaimerDetailRequest = BaseParams;

// ------query------
export type DisclaimerListResponse = BaseResponse & {
  data: DisclaimerType[];
  meta: MetaPagination;
};

export type DisclaimerDetailResponse = BaseResponse & {
  data: DisclaimerType & DisclaimerPartIType;
};

// ------mutation------
export type CreateDisclaimerBody = {
  judul: string;
  judul_en: string;
  konten: string;
  konten_en: string;
};

export type CreateDisclaimerResponse = BaseResponse & {
  data: DisclaimerType & DisclaimerPartIType;
};

export type UpdateDisclaimerParams = BaseParams;

export type UpdateDisclaimerBody = {
  judul: string;
  judul_en: string;
  konten: string;
  konten_en: string;
  is_active: boolean;
};

export type UpdateDisclaimerResponse = BaseResponse & {
  data: DisclaimerType & DisclaimerPartIType;
};

export type DeleteDisclaimerParams = BaseParams;

export type DeleteDisclaimerResponse = BaseResponse;

export type ChangeStatusDisclaimerParams = BaseParams;

export type ChangeStatusDisclaimerResponse = BaseResponse & {
  data: { id: string; is_active: boolean };
};
