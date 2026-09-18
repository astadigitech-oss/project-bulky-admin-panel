import { UseApiQueryProps } from "@/lib/query/use-query";
import { keepPreviousData } from "@tanstack/react-query";

import {
  AuctionBidsRequest,
  AuctionBatchDetail,
  AuctionBatchSummary,
  AuctionBidDetail,
  AuctionListRequest,
  AuctionProductOption,
  AuctionProductOptionsRequest,
  BaseResponse,
  PaginatedResponse,
} from "./types";

const key = ["auction-list", "auction-detail", "auction-bids", "auction-product-options"];

export const dataAPIAuction = {
  query: ({
    id,
    page,
    per_page,
    search,
    status,
    sort_by,
    warehouse_id,
    buyer_id,
  }: AuctionListRequest &
    AuctionBidsRequest &
    AuctionProductOptionsRequest & { id?: string }): {
    list: UseApiQueryProps<PaginatedResponse<AuctionBatchSummary>>;
    detail: UseApiQueryProps<BaseResponse<AuctionBatchDetail>>;
    bids: UseApiQueryProps<PaginatedResponse<AuctionBidDetail>>;
    productOptions: UseApiQueryProps<PaginatedResponse<AuctionProductOption>>;
  } => ({
    list: {
      key: [key[0], { page, per_page, search, status, sort_by }],
      endpoint: "/auctions",
      searchParams: { page, per_page, search, status, sort_by },
      placeholderData: keepPreviousData,
    },
    detail: {
      key: [key[1], { id }],
      endpoint: `/auctions/${id}`,
      enabled: !!id,
    },
    bids: {
      key: [key[2], { id, page, per_page, search, buyer_id, sort_by }],
      endpoint: `/auctions/${id}/bids`,
      searchParams: { page, per_page, search, buyer_id, sort_by },
      placeholderData: keepPreviousData,
    },
    productOptions: {
      key: [key[3], { page, per_page, search, warehouse_id }],
      endpoint: "/auctions/product-options",
      searchParams: { page, per_page, search, warehouse_id },
      placeholderData: keepPreviousData,
    },
  }),
};
