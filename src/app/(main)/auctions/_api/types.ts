import { MetaPagination } from "@/lib/types";

// ============================================================
// Response envelope (backend helper)
// ============================================================

export type AuctionStatus = "DRAFT" | "OPEN" | "SOLD";
export type AuctionOriginType = "BULKY_WAREHOUSE" | "SUPPLIER";
export type AuctionItemSourceType = "CATALOG" | "MANUAL";
export type AuctionPaymentStatus = "UNPAID" | "PAID";
export type AuctionFulfillmentStatus = "PENDING" | "PROCESSING" | "COMPLETED";

export type BaseResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type PaginatedResponse<T> = {
  success: boolean;
  message: string;
  data: T[];
  meta: MetaPagination;
};

// ============================================================
// List / Detail
// ============================================================

export type AuctionBatchSummary = {
  id: string;
  code: string;
  nama_id: string;
  thumbnail_url: string | null;
  status: AuctionStatus;
  grand_total: string;
  min_bid_amount: string;
  bidder_count: number;
  bid_count: number;
  highest_bid: string | null;
  created_at: string;
  opened_at: string | null;
  sold_at: string | null;
  version: number;
};

export type AuctionItemSnapshot = {
  produk_id: string | null;
  source_type: AuctionItemSourceType;
  nama_snapshot: string;
  quantity: number;
  unit_price_snapshot: string;
  subtotal_snapshot: string;
};

export type AuctionAsset = {
  id: string;
  kind: "IMAGE" | "PDF";
  url: string;
  original_name: string;
  mime_type: string;
  size_bytes: number;
};

export type AuctionSupplierExcelColumn = {
  index: number;
  letter: string;
  header: string;
  samples: string[];
};

export type AuctionSupplierExcelPreview = {
  sheet_name: string;
  header_row: number;
  columns: AuctionSupplierExcelColumn[];
};

export type AuctionSupplierExcelImport = {
  items: { source_type: "MANUAL"; nama: string; unit_price: string; quantity: number }[];
  pdf: AuctionAsset;
};

export type AuctionWarehouseOrigin = {
  id: string;
  nama: string;
  alamat: string | null;
  kota: string | null;
  kode_pos: string | null;
  latitude: number | null;
  longitude: number | null;
};

export type AuctionBuyerSimple = {
  id: string;
  nama: string;
  telepon: string;
};

export type AuctionWinner = {
  bid_id: string;
  buyer: AuctionBuyerSimple;
  deal_amount: string;
  selected_by: string;
  selected_at: string;
  note: string | null;
  payment_status: AuctionPaymentStatus;
  paid_at: string | null;
  payment_note: string | null;
  fulfillment_status: AuctionFulfillmentStatus;
  completed_at: string | null;
  fulfillment_note: string | null;
};

export type AuctionBatchDetail = {
  id: string;
  code: string;
  nama_id: string;
  nama_en: string | null;
  description: string | null;
  warehouse_id: string | null;
  origin_type: AuctionOriginType;
  supplier_name: string | null;
  supplier_address: string | null;
  supplier_provinsi: string | null;
  supplier_kota: string | null;
  supplier_kecamatan: string | null;
  supplier_kelurahan: string | null;
  supplier_kode_pos: string | null;
  supplier_latitude: string | null;
  supplier_longitude: string | null;
  kategori_id: string | null;
  kondisi_id: string | null;
  kondisi_paket_id: string | null;
  sumber_id: string | null;
  discrepancy_percentage: string;
  status: AuctionStatus;
  grand_total: string;
  min_bid_percent: string;
  min_bid_amount: string;
  total_quantity: number;
  panjang_cm: string;
  lebar_cm: string;
  tinggi_cm: string;
  berat_kg: string;
  volume_m3: string;
  version: number;
  created_by: string;
  updated_by: string;
  created_at: string;
  updated_at: string;
  opened_at: string | null;
  sold_at: string | null;
  items: AuctionItemSnapshot[];
  merek_ids: string[];
  images: AuctionAsset[];
  pdf: AuctionAsset | null;
  winner: AuctionWinner | null;
  bidder_count: number;
  bid_count: number;
  highest_bid: string | null;
  lowest_bid: string | null;
  view_count: number;
  repeat_bidder_count: number;
  additional_bid_count: number;
  time_to_sold_seconds: number | null;
};

export type AuctionBidDetail = {
  id: string;
  batch_id: string;
  buyer: AuctionBuyerSimple;
  sequence: number;
  input_mode: "AMOUNT" | "PERCENT";
  input_percent: string | null;
  effective_percent: string;
  amount: string;
  grand_total_snapshot: string;
  created_at: string;
  is_selected: boolean;
};

export type AuctionProductOption = {
  id: string;
  nama_id: string;
  warehouse_id: string;
  unit_price: string;
  stock_available: number;
  is_active: boolean;
  is_sold: boolean;
};

// Master select item (dropdown)
export type MasterSelectItem = {
  id: string;
  nama?: string;
  nama_id?: string;
  nama_en?: string;
  slug?: string;
};

// ============================================================
// Request
// ============================================================

export type AuctionDraftInput = {
  version?: number;
  nama_id: string;
  nama_en?: string | null;
  description?: string | null;
  warehouse_id?: string | null;
  origin_type?: AuctionOriginType;
  supplier_name?: string | null;
  supplier_address?: string | null;
  supplier_provinsi?: string | null;
  supplier_kota?: string | null;
  supplier_kecamatan?: string | null;
  supplier_kelurahan?: string | null;
  supplier_kode_pos?: string | null;
  supplier_latitude?: string | null;
  supplier_longitude?: string | null;
  kategori_id?: string | null;
  kondisi_id?: string | null;
  kondisi_paket_id?: string | null;
  sumber_id?: string | null;
  discrepancy_percentage?: string;
  merek_ids?: string[];
  items?: {
    source_type: AuctionItemSourceType;
    produk_id?: string;
    nama?: string;
    unit_price?: string;
    quantity: number;
  }[];
  panjang_cm?: string;
  lebar_cm?: string;
  tinggi_cm?: string;
  berat_kg?: string;
  image_asset_ids?: string[];
  pdf_asset_id?: string | null;
};

export type AuctionListRequest = {
  page?: number;
  per_page?: number;
  search?: string;
  status?: AuctionStatus | "all";
  sort_by?: string;
};

export type AuctionBidsRequest = {
  page?: number;
  per_page?: number;
  search?: string;
  buyer_id?: string;
  sort_by?: string;
};

export type AuctionProductOptionsRequest = {
  page?: number;
  per_page?: number;
  search?: string;
  warehouse_id?: string;
};

export type AuctionPublishBody = {
  version: number;
};

export type AuctionWinnerBody = {
  bid_id: string;
  version: number;
  note?: string | null;
};

export type AuctionOperationBody = {
  version: number;
  payment_status?: AuctionPaymentStatus;
  fulfillment_status?: AuctionFulfillmentStatus;
  note?: string | null;
};
