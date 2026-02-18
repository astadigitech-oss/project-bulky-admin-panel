import {
  BaseListParams,
  BaseParams,
  BaseResponse,
  MetaPagination,
} from "@/lib/types";

export type ProductPartIType = {
  file_pdf: string;
  gambar_utama: null | string;
  id: string;
  nama_en: string;
  nama_id: string;
  reference_id: null | string;
  status: boolean;
};

export type ProductListRequest = BaseListParams;

export type ProductListResponse = BaseResponse & {
  data: ProductPartIType[];
  meta: MetaPagination;
};

export type ProductDetailRequest = BaseParams;

export type ProductDetailResponse = BaseResponse & {
  data: {
    berat: number;
    berat_volumetrik: number;
    created_at: string;
    discrepancy: string;
    dokumen: {
      file_url: string;
      id: string;
      nama_dokumen: string;
      tipe_file: string;
      ukuran_file: number;
    }[];
    gambar: {
      gambar_url: string;
      id: string;
      is_primary: boolean;
      urutan: number;
    }[];
    harga_sebelum_diskon: number;
    harga_sesudah_diskon: number;
    id: string;
    id_cargo: string;
    is_active: boolean;
    kategori: { id: string; nama: string };
    kondisi: { id: string; nama: string };
    kondisi_paket: { id: string; nama: string };
    lebar: number;
    mereks: { id: string; nama: string }[];
    nama_en: string;
    nama_id: string;
    panjang: number;
    quantity: number;
    quantity_terjual: number;
    reference_id: null;
    slug: string;
    sumber: { id: string; nama: string };
    tinggi: number;
    updated_at: string;
  };
};

export type CreateProductBody = FormData;

export type CreateProductResponse = BaseResponse & {
  data: {
    id: string;
    nama_id: string;
  };
};

export type ChangeStatusProductParams = BaseParams;

export type ChangeStatusProductResponse = BaseResponse & {
  data: { id: string; is_active: boolean };
};
