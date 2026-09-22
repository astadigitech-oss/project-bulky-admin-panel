import { useMutate } from "@/lib/query";
import { useApiQuery } from "@/lib/query/use-query";
import { useQueryClient } from "@tanstack/react-query";
import { dataAPIAuctionEducationBanner } from "./data";
import {
  AuctionEducationBannerListRequest,
  AuctionEducationBannerParams,
} from "./types";
export const useGetAuctionEducationBannerList = (
  params: AuctionEducationBannerListRequest,
) => useApiQuery(dataAPIAuctionEducationBanner.query(params).list);
export const useGetAuctionEducationBannerDetail = (
  params: AuctionEducationBannerParams,
) => useApiQuery(dataAPIAuctionEducationBanner.query(params).show);
export const useCreateAuctionEducationBanner = () =>
  useMutate(dataAPIAuctionEducationBanner.mutation(useQueryClient()).create);
export const useUpdateAuctionEducationBanner = () =>
  useMutate(dataAPIAuctionEducationBanner.mutation(useQueryClient()).update);
export const usePublishAuctionEducationBanner = () =>
  useMutate(dataAPIAuctionEducationBanner.mutation(useQueryClient()).publish);
export const useDraftAuctionEducationBanner = () =>
  useMutate(dataAPIAuctionEducationBanner.mutation(useQueryClient()).draft);
export const useDeleteAuctionEducationBanner = () =>
  useMutate(dataAPIAuctionEducationBanner.mutation(useQueryClient()).delete);
export const useReorderAuctionEducationBanners = () =>
  useMutate(dataAPIAuctionEducationBanner.mutation(useQueryClient()).reorder);
