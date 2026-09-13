import { useMutate } from "@/lib/query";
import { useApiQuery } from "@/lib/query/use-query";
import { useQueryClient } from "@tanstack/react-query";
import { dataAPISeasonalCampaign } from "./data";
import { SeasonalCampaignListRequest, SeasonalCampaignParams } from "./types";

export const useGetSeasonalCampaignList = (params: SeasonalCampaignListRequest) =>
  useApiQuery(dataAPISeasonalCampaign.query(params).list);
export const useGetSeasonalCampaignDetail = ({ id }: SeasonalCampaignParams) =>
  useApiQuery(dataAPISeasonalCampaign.query({ id }).show);
export const useCreateSeasonalCampaign = () => useMutate(dataAPISeasonalCampaign.mutation(useQueryClient()).create);
export const useUpdateSeasonalCampaign = () => useMutate(dataAPISeasonalCampaign.mutation(useQueryClient()).update);
export const usePublishSeasonalCampaign = () => useMutate(dataAPISeasonalCampaign.mutation(useQueryClient()).publish);
export const useCancelSeasonalCampaign = () => useMutate(dataAPISeasonalCampaign.mutation(useQueryClient()).cancel);
export const useDeleteSeasonalCampaign = () => useMutate(dataAPISeasonalCampaign.mutation(useQueryClient()).delete);
