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
  is_sold: boolean;
  is_sale: boolean;
  is_qc_pass: boolean;
  nama_en: string;
  nama_id: string;
  reference_id: null | string;
  status: boolean;
};

export type ProductListRequest = BaseListParams & {
  status?: "all" | "available" | "sold out";
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
    is_sale: boolean;
    is_qc_pass: boolean;
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
    sumber: { id: string; nama: string } | null;
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

export type ChangeSaleProductParams = BaseParams;

export type ChangeSaleProductResponse = BaseResponse & {
  data: { id: string; is_sale: boolean };
};

export type ChangeQcPassProductParams = BaseParams;

export type ChangeQcPassProductResponse = BaseResponse & {
  data: { id: string; is_qc_pass: boolean };
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

// Test koneksi WMS (fondasi sync produk palet dari inventory WMS jadi cargo
// online). Bentuk `data.data` masih interface{} di BE karena belum
// didokumentasikan detail oleh tim WMS.
export type TestWmsConnectionResponse = BaseResponse & {
  data: {
    success: boolean;
    message: string;
    data: unknown;
  };
};

// Sync produk palet dari WMS — daftar cargo yang siap diberi harga.
export type WmsCargoRefType = { id: string; name: string };

export type WmsCargoPricingType = {
  id: string;
  code: string;
  length_cm: number;
  width_cm: number;
  height_cm: number;
  weight_kg: number;
  total_price: number;
  bulky_category: WmsCargoRefType | null;
  bulky_product_condition: WmsCargoRefType | null;
  bulky_package_condition: WmsCargoRefType | null;
  bulky_product_source: WmsCargoRefType | null;
  bulky_brands: WmsCargoRefType[] | null;
  created_at: string;
  updated_at: string;
};

export type ListWmsCargoRequest = {
  page?: number;
  limit?: number;
  search?: string;
};

export type ListWmsCargoResponse = BaseResponse & {
  data: WmsCargoPricingType[];
  meta: MetaPagination;
};

export type SetWmsCargoPriceParams = { id: string };

export type SetWmsCargoPriceBody = {
  type: "discount" | "fix";
  value: number;
};

export type SetWmsCargoPriceResponse = BaseResponse & {
  data: {
    id: string;
    code: string;
    pricing_type: string;
    pricing_value: number;
    total_price: number;
    sale_price: number;
    priced_at: string;
    pricing_pdf_url: string;
  };
};

// Cargo WMS yang sudah diberi harga (langsung dari WMS, bukan cache lokal) —
// sumber dropdown "ID Cargo" saat create produk. Memilih salah satu
// meng-auto-fill dimensi, harga (before/after, jadi read-only), serta
// kategori/kondisi/sumber/merek (ID dari WMS kompatibel dengan ID lokal
// Bulky). PDF harga didownload terpisah lewat endpoint pricing-pdf.
export type WmsCargoPricedItemType = {
  id: string;
  code: string;
  length_cm: number;
  width_cm: number;
  height_cm: number;
  weight_kg: number;
  total_price: number;
  pricing_type: string;
  pricing_value: number;
  sale_price: number;
  priced_at: string;
  pricing_pdf_url: string;
  bulky_category: WmsCargoRefType | null;
  bulky_product_condition: WmsCargoRefType | null;
  bulky_package_condition: WmsCargoRefType | null;
  bulky_product_source: WmsCargoRefType | null;
  bulky_brands: WmsCargoRefType[] | null;
  created_at: string;
  updated_at: string;
};

export type ListWmsCargoPricedRequest = {
  search?: string;
};

export type ListWmsCargoPricedResponse = BaseResponse & {
  data: WmsCargoPricedItemType[];
};

export type DownloadWmsCargoPricingPdfParams = { id: string };

export type MarkWmsCargoSyncedParams = { id: string };

export type MarkWmsCargoSyncedResponse = BaseResponse & {
  data: {
    id: string;
    code: string;
    is_sync: boolean;
    synced_at: string;
  };
};
