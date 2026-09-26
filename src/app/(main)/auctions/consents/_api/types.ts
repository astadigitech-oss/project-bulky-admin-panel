import {
  BaseListParams,
  BaseParams,
  BaseResponse,
  MetaPagination,
} from "@/lib/types";

export type PersetujuanSyaratLelangListRequest = BaseListParams;
export type PersetujuanSyaratLelangDetailRequest = BaseParams;

export type PersetujuanSyaratLelangItem = {
  id: string;
  buyer_id: string;
  buyer_nama: string;
  buyer_email: string;
  bid_id: string;
  bid_sequence: number;
  bid_amount: string;
  batch_id: string;
  batch_kode: string;
  batch_nama: string;
  terms_document_id: string;
  terms_judul: string;
  locale: string;
  content_hash: string;
  disetujui_at: string;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
};

export type PersetujuanSyaratLelangListResponse = BaseResponse & {
  data: PersetujuanSyaratLelangItem[];
  meta: MetaPagination;
};

export type PersetujuanSyaratLelangDetailResponse = BaseResponse & {
  data: PersetujuanSyaratLelangItem;
};
