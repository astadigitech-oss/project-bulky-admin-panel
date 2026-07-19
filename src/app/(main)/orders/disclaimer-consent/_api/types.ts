import {
  BaseListParams,
  BaseParams,
  BaseResponse,
  MetaPagination,
} from "@/lib/types";

// ─── Request ────────────────────────────────────────────────────────────────

export type DisclaimerConsentListRequest = BaseListParams;

export type DisclaimerConsentDetailRequest = BaseParams;

// ─── Response ───────────────────────────────────────────────────────────────

export type DisclaimerConsentItem = {
  id: string;
  buyer_id: string;
  buyer_nama: string;
  buyer_email: string;
  pesanan_id: string;
  pesanan_kode: string;
  disclaimer_id: string;
  disetujui_at: string;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
};

export type DisclaimerConsentListResponse = BaseResponse & {
  data: DisclaimerConsentItem[];
  meta: MetaPagination;
};

export type DisclaimerConsentDetailResponse = BaseResponse & {
  data: DisclaimerConsentItem;
};
