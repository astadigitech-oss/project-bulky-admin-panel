import { BaseResponse } from "@/lib/types";

// types
// ------partials------
export type TermPoliciesType = {
  created_at: string;
  id: string;
  judul: string;
  judul_en: string;
  konten: string;
  konten_en: string;
  updated_at: string;
};

// ------query------
export type TermPoliciesDetailResponse = BaseResponse & {
  data: TermPoliciesType;
};

// ------mutation------
export type UpdateTermPoliciesBody = {
  judul: string;
  judul_en: string;
  konten: string;
  konten_en: string;
};

export type UpdateTermPoliciesResponse = BaseResponse & {
  data: TermPoliciesType;
};
