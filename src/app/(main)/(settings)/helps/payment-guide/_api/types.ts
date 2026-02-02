import { BaseResponse } from "@/lib/types";

// types
// ------partials------
export type PaymentHelpType = {
  created_at: string;
  id: string;
  judul: string;
  judul_en: string;
  konten: string;
  konten_en: string;
  updated_at: string;
};

// ------query------
export type PaymentHelpDetailResponse = BaseResponse & {
  data: PaymentHelpType;
};

// ------mutation------
export type UpdatePaymentHelpBody = {
  judul: string;
  judul_en: string;
  konten: string;
  konten_en: string;
};

export type UpdatePaymentHelpResponse = BaseResponse & {
  data: PaymentHelpType;
};
