import { BaseResponse } from "@/lib/types";

// types
// ------partials------
export type BuyHelpType = {
  created_at: string;
  id: string;
  judul: string;
  judul_en: string;
  konten: string;
  konten_en: string;
  updated_at: string;
};

// ------query------
export type BuyHelpDetailResponse = BaseResponse & {
  data: BuyHelpType;
};

// ------mutation------
export type UpdateBuyHelpBody = {
  judul: string;
  judul_en: string;
  konten: string;
  konten_en: string;
};

export type UpdateBuyHelpResponse = BaseResponse & {
  data: BuyHelpType;
};
