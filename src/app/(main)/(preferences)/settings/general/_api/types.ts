import { BaseParams, BaseResponse } from "@/lib/types";

type WhatsAppType = {
  id: string;
  nomor_wa: string;
  pesan_awal: string;
  updated_at: string;
  whatsapp_url: string;
};

type WarehouseType = {
  alamat: string;
  created_at: string;
  id: string;
  jam_operasional: string;
  kode_pos: string;
  kota: string;
  latitude: string;
  longitude: string;
  nama: string;
  updated_at: string;
};

export type ScheduleType = {
  hari: number;
  id: string;
  is_buka: boolean;
  jam_buka: null | string;
  jam_tutup: null | string;
  nama_hari: string;
};

export type PaymentType = {
  id: string;
  is_active: boolean;
  kode: string;
  logo_value: string;
  nama: string;
  urutan: number;
};

// query
export type WhatsAppHandlerResponse = BaseResponse & { data: WhatsAppType };

export type GetWarehouseResponse = BaseResponse & { data: WarehouseType };

export type GetScheduleResponse = BaseResponse & { data: ScheduleType[] };

export type GetPaymentResponse = BaseResponse & {
  data: {
    group: string;
    is_active: boolean;
    methods: PaymentType[];
    urutan: number;
  }[];
};

// mutation
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
  data: {
    id: string;
    nama: string;
    email: string;
  };
};

export type ChangePasswordBody = {
  current_password: string;
  new_password: string;
  confirm_password: string;
};

export type ChangePasswordResponse = BaseResponse;

export type UpdateWarehouseBody = {
  alamat: string;
  jam_operasional: string;
  kode_pos: string;
  kota: string;
  latitude: number;
  longitude: number;
  nama: string;
};

export type UpdateWarehouseResponse = BaseResponse & {
  data: WarehouseType;
};

export type UpdateScheduleBody = {
  jadwal: {
    /**
     * 0-6 (0=Minggu, 6=Sabtu)
     */
    hari: number;
    /**
     * If `is_buka=true`, then `jam_buka` and `jam_tutup` must be provided
     */
    is_buka: boolean;
    /**
     * format "HH:mm"
     */
    jam_buka: null | string;
    /**
     * format "HH:mm"
     */
    jam_tutup: null | string;
  }[];
};

export type UpdateScheduleResponse = BaseResponse;

export type UpdatePaymentParams = BaseParams;

export type UpdatePaymentResponse = BaseResponse & {
  data: { id: string; is_active: boolean; kode: string; nama: string };
};
