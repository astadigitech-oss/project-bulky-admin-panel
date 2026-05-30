import {
  BaseListParams,
  BaseParams,
  BaseResponse,
  DuoLangType,
  MetaPagination,
} from "@/lib/types";

export type JenisDiskonType = "persentase" | "jumlah_tetap";

// ------partials------
export type CouponType = {
  id: string;
  status: boolean;
  jenis_diskon: JenisDiskonType;
  kode: string;
  nama: string;
  nilai_diskon: number;
  updated_at: string;
};

export type CouponDetailType = {
  id: string;
  kode: string;
  nama: string;
  deskripsi: string;
  jenis_diskon: JenisDiskonType;
  nilai_diskon: number;
  minimal_pembelian: number;
  limit_pemakaian: number;
  total_usage: number;
  remaining_usage: number;
  tanggal_kedaluarsa: string;
  is_all_kategori: boolean;
  kategori: {
    id: string;
    nama: DuoLangType;
    slug: string;
  }[];
  is_active: boolean;
  is_expired: boolean;
  created_at: string;
  updated_at: string;
};

export type CouponCategoryType = {
  id: string;
  nama: DuoLangType;
};

export type CouponUsageType = {
  id: string;
  buyer: { id: string; nama: string; email: string };
  pesanan: { id: string; kode: string };
  nilai_potongan: number;
  created_at: string;
};

// ------request------
export type CouponListRequest = BaseListParams & {
  jenis_diskon?: JenisDiskonType;
  is_active?: boolean;
  is_expired?: boolean;
};

export type CouponDetailRequest = BaseParams;

export type CouponUsageRequest = BaseParams & {
  page?: number;
  per_page?: number;
};

// ------query------
export type CouponListResponse = BaseResponse & {
  data: CouponType[];
  meta: MetaPagination;
};

export type CouponDetailResponse = BaseResponse & {
  data: CouponDetailType;
};

export type CouponCategorySelectResponse = BaseResponse & {
  data: CouponCategoryType[];
};

export type CouponUsagesResponse = BaseResponse & {
  data: {
    kupon: { id: string; kode: string; total_usage: number };
    usages: CouponUsageType[];
  };
  meta: MetaPagination;
};

// ------mutation------
export type CreateCouponBody = {
  kode: string;
  nama?: string;
  deskripsi?: string;
  jenis_diskon: JenisDiskonType;
  nilai_diskon: number;
  minimal_pembelian: number;
  limit_pemakaian?: number;
  tanggal_kedaluarsa: string;
  is_all_kategori: boolean;
  kategori?: string[];
};

export type CreateCouponResponse = BaseResponse & {
  data: CouponDetailType;
};

export type UpdateCouponParams = BaseParams;

export type UpdateCouponBody = Partial<CreateCouponBody>;

export type UpdateCouponResponse = BaseResponse & {
  data: CouponDetailType;
};

export type DeleteCouponParams = BaseParams;

export type DeleteCouponResponse = BaseResponse;

export type ToggleStatusCouponParams = BaseParams;

export type ToggleStatusCouponResponse = BaseResponse & {
  data: { id: string; kode: string; is_active: boolean; updated_at: string };
};

export type GenerateCouponCodeBody = {
  prefix?: string;
  length?: number;
};

export type GenerateCouponCodeResponse = BaseResponse & {
  data: { kode: string };
};
