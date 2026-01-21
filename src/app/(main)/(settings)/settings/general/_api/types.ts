import { BaseResponse } from "@/lib/types";

type WhatsAppType = {
  id: string;
  nomor_wa: string;
  pesan_awal: string;
  updated_at: string;
  whatsapp_url: string;
};
// types
export type WhatsAppHandlerResponse = BaseResponse & { data: WhatsAppType };

export type UpdateWhatsAppHandlerBody = {
  nomor_wa: string;
  pesan_awal: string;
};

export type UpdateWhatsAppHandlerResponse = BaseResponse & {
  data: WhatsAppType;
};

export type UpdateProfileBody = {
  email: string;
  nama: string;
};

export type UpdateProfileResponse = BaseResponse & {
  id: string;
  nama: string;
  email: string;
};

export type ChangePasswordBody = {
  current_password: string;
  new_password: string;
  confirm_password: string;
};

export type ChangePasswordResponse = BaseResponse;
