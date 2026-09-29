import {
  BaseListParams,
  BaseParams,
  BaseResponse,
  MetaPagination,
} from "@/lib/types";

export type AuctionEducationBanner = {
  id: string;
  nama: string;
  gambar_url: { id: string; en?: string | null };
  urutan: number;
  status: "draft" | "published";
  updated_at: string;
};
export type AuctionEducationBannerListRequest = BaseListParams;
export type AuctionEducationBannerListResponse = BaseResponse & {
  data: AuctionEducationBanner[];
  meta: MetaPagination;
};
export type AuctionEducationBannerParams = BaseParams;
export type AuctionEducationBannerMutationBody = FormData;
export type AuctionEducationBannerReorderBody = { ids: string[] };
export type AuctionEducationBannerDetailResponse = BaseResponse & {
  data: AuctionEducationBanner;
};
export type AuctionEducationBannerMutationResponse = BaseResponse & {
  data: AuctionEducationBanner;
};
