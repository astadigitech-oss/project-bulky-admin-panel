import { BaseParams, BaseResponse, MetaPagination } from "@/lib/types";

// ─── Request ─────────────────────────────────────────────────────────────────

export type ReviewListRequest = {
  page?: number;
  per_page?: number;
  cari?: string;
  rating?: number;
  is_approved?: boolean;
  sort_by?: string;
  sort_order?: "asc" | "desc";
};

export type ReviewDetailRequest = BaseParams;

export type ApproveReviewParams = BaseParams;
export type RejectReviewParams = BaseParams;
export type DeleteReviewParams = BaseParams;

export type BulkApproveReviewBody = {
  ids: string[];
};

// ─── Response ────────────────────────────────────────────────────────────────

export type ReviewItem = {
  id: string;
  rating: number;
  buyer: { id: string; nama: string };
  approved: { at: string | null; by: string | null; status: boolean };
  gambar: boolean;
  created_at: string;
  pesanan: { id: string; kode: string };
};

export type ReviewListResponse = BaseResponse & {
  data: ReviewItem[];
  meta: MetaPagination & { total_items: number };
};

export type ReviewDetail = {
  id: string;
  buyer: { id: string; nama: string; email: string; telepon: string };
  pesanan: { id: string; kode: string; order_status: string; created_at: string };
  produk: { id: string; nama: string; slug: string; gambar_url: string };
  rating: number;
  komentar: string;
  gambar_url: string | null;
  is_approved: boolean;
  approved_at: string | null;
  approved_by: { id: string; nama: string } | null;
  created_at: string;
  updated_at: string;
};

export type ReviewDetailResponse = BaseResponse & { data: ReviewDetail };

export type ApproveReviewResponse = BaseResponse & {
  data: {
    id: string;
    is_approved: boolean;
    approved_at: string;
    approved_by: string;
  };
};

export type RejectReviewResponse = BaseResponse & {
  data: {
    id: string;
    is_approved: boolean;
    approved_at: null;
    approved_by: null;
  };
};

export type BulkApproveReviewResponse = BaseResponse & {
  data: {
    approved_count: number;
    approved_ids: string[];
  };
};

export type DeleteReviewResponse = BaseResponse;
