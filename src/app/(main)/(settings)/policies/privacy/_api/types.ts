import { BaseResponse } from "@/lib/types";

// types
// ------partials------
export type PrivacyPoliciesType = {
  created_at: string;
  id: string;
  judul: string;
  judul_en: string;
  konten: string;
  konten_en: string;
  updated_at: string;
};

// ------query------
export type PrivacyPoliciesDetailResponse = BaseResponse & {
  data: PrivacyPoliciesType;
};

// ------mutation------
export type UpdatePrivacyPoliciesBody = {
  judul: string;
  judul_en: string;
  konten: string;
  konten_en: string;
};

export type UpdatePrivacyPoliciesResponse = BaseResponse & {
  data: PrivacyPoliciesType;
};
