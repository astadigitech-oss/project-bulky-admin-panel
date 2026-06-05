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

export type ProductListRequest = BaseListParams & {
  is_sold?: boolean;
};

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
    discrepancy: string | null;
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
    is_sold: boolean;
    kategori: { id: string; nama: string };
    kondisi: { id: string; nama: string };
    kondisi_paket: { id: string; nama: string };
    lebar: number;
    mereks: { id: string; nama: string }[];
    nama_en: string;
    nama_id: string;
    panjang: number;
    quantity: number;
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

export type UpdateProductParams = BaseParams;

export type UpdateProductBody = FormData;

export type UpdateProductResponse = BaseResponse & {
  data: {
    id: string;
    nama_id: string;
  };
};

export type DeleteProductParams = BaseParams;

export type DeleteProductResponse = BaseResponse;

export type ChangeStatusProductParams = BaseParams;

export type ChangeStatusProductResponse = BaseResponse & {
  data: { id: string; is_active: boolean };
};

export type UploadProductImageParams = BaseParams;

export type UploadProductImageBody = FormData;

export type UploadProductImageResponse = BaseResponse & {
  data: { gambar_url: string; id: string; is_primary: boolean; urutan: number };
};

export type ReorderProductImageParams = BaseParams & { imageId: string };

export type ReorderProductImageBody = { direction: "up" | "down" };

export type ReorderProductImageResponse = BaseResponse & {
  data: {
    item: { id: string; urutan: number };
    swapped_with: { id: string; urutan: number };
  };
};

export type DeleteProductImageParams = BaseParams & { imageId: string };

export type DeleteProductImageResponse = BaseResponse;
