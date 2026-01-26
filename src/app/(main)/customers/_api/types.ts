import {
  BaseListParams,
  BaseParams,
  BaseResponse,
  MetaPagination,
} from "@/lib/types";

// types
// ------partials------
export type BuyerListRequest = BaseParams;

export type BuyerDetailRequest = BaseListParams;

export type BuyerChartRequest = {
  filter?: "year" | "month" | "week" | "custom";
  tahun?: number;
  bulan?: number;
  minggu?: number;
  tanggal_dari?: string;
  tanggal_sampai?: string;
};

// ------query------
export type BuyerListResponse = BaseResponse & {
  data: {
    created_at: string;
    email: string;
    id: string;
    nama: string;
    telepon: string;
    username: string;
  }[];
  meta: MetaPagination;
};

export type BuyerDetailResponse = BaseResponse & {
  data: {
    alamat: {
      alamat_formatted?: string;
      alamat_lengkap?: string;
      buyer_id?: string;
      catatan?: string;
      created_at?: string;
      google_place_id?: string;
      id?: string;
      is_default?: boolean;
      kecamatan?: string;
      kelurahan?: string;
      kode_pos?: string;
      kota?: string;
      label?: string;
      latitude?: number;
      longitude?: number;
      nama_penerima?: string;
      provinsi?: string;
      telepon_penerima?: string;
      updated_at?: string;
    }[];
    created_at: string;
    email: string;
    foto_url: null;
    id: string;
    nama: string;
    telepon: string;
    updated_at: string;
    username: string;
  };
};

export type BuyerChartResponse = BaseResponse & {
  data: {
    chart: { date: string; user: number }[];
    mode: string;
    total: number;
  };
};

export type BuyerStatResponse = BaseResponse & {
  data: {
    /**
     * Buyer yang sudah verifikasi
     */
    buyer_verified: number;
    /**
     * Presentasi buyer terdaftar bulan ini vs bulan sebelumnya
     */
    persentase_bulan_ini: {
      /**
       * Total buyer bulan ini
       */
      current: number;
      /**
       * Total buyer bulan lalu
       */
      previous: number;
      /**
       * "up" / "down" / "stable"
       */
      trend: "up" | "down" | "stable";
      /**
       * Persentase perubahan vs bulan lalu
       */
      value: number;
    };
    /**
     * Presentasi buyer terdaftar tahun ini vs tahun sebelumnya
     */
    persentase_tahun_ini: {
      /**
       * Total buyer bulan ini
       */
      current: number;
      /**
       * Total buyer bulan lalu
       */
      previous: number;
      /**
       * "up" / "down" / "stable"
       */
      trend: "up" | "down" | "stable";
      /**
       * Persentase perubahan vs bulan lalu
       */
      value: number;
    };
    /**
     * Registrasi buyer baru bulan ini
     */
    registrasi_bulan_ini: number;
    /**
     * Registrasi buyer baru tahun ini
     */
    registrasi_tahun_ini: number;
    /**
     * Total semua buyer
     */
    total_buyer: number;
  };
};

// ------mutation------
export type DeleteBuyerParams = BaseParams;

export type DeleteBuyerResponse = BaseResponse;

export type ResetPasswordBuyerParams = BaseParams;

export type ResetPasswordBuyerBody = { new_password: string };

export type ResetPasswordBuyerResponse = BaseResponse & {
  data: { id: string; is_active: boolean };
};
