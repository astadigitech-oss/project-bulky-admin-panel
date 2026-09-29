import { BaseListParams, BaseParams, BaseResponse, MetaPagination } from "@/lib/types";

export type SeasonalCampaignStatus =
  | "draft"
  | "scheduled"
  | "active"
  | "ended"
  | "cancelled";

export type SeasonalCampaignAssets = {
  web_logo_url: string | null;
  mobile_loading_logo_url: string | null;
  web_navbar_decoration_url: string | null;
  mobile_top_app_bar_ornament_url: string | null;
};

export type SeasonalCampaign = {
  id: string;
  nama: string;
  status: SeasonalCampaignStatus;
  tanggal_mulai: string | null;
  tanggal_selesai: string | null;
  assets: SeasonalCampaignAssets;
  created_at: string;
  updated_at: string;
};

export type SeasonalCampaignListRequest = BaseListParams & {
  status?: SeasonalCampaignStatus;
};

export type SeasonalCampaignListResponse = BaseResponse & {
  data: SeasonalCampaign[];
  meta: MetaPagination;
};

export type SeasonalCampaignDetailResponse = BaseResponse & {
  data: SeasonalCampaign;
};

export type SeasonalCampaignFormBody = FormData;
export type SeasonalCampaignMutationResponse = BaseResponse & {
  data: SeasonalCampaign;
};

export type SeasonalCampaignParams = BaseParams;
