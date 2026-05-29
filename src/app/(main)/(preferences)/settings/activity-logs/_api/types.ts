import { BaseListParams, BaseParams, BaseResponse, MetaPagination } from "@/lib/types";

export type ActivityLogType = {
  id: string;
  user_type: string;
  user_id: string | null;
  action: string;
  modul: string;
  entity_type: string | null;
  entity_id: string | null;
  deskripsi: string;
  ip_address: string;
  user_agent: string;
  created_at: string;
};

export type ActivityLogListRequest = BaseListParams;
export type ActivityLogDetailRequest = BaseParams;

export type ActivityLogListResponse = BaseResponse & {
  data: ActivityLogType[];
  meta: MetaPagination;
};

export type ActivityLogDetailResponse = BaseResponse & {
  data: ActivityLogType;
};
