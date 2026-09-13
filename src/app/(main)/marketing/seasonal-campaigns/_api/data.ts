import { apiUrl } from "@/config";
import { invalidateQuery } from "@/lib/query";
import { UseMutateConfig } from "@/lib/query/types";
import { UseApiQueryProps } from "@/lib/query/use-query";
import { keepPreviousData, QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  SeasonalCampaignDetailResponse,
  SeasonalCampaignFormBody,
  SeasonalCampaignListRequest,
  SeasonalCampaignListResponse,
  SeasonalCampaignMutationResponse,
  SeasonalCampaignParams,
} from "./types";

const key = ["seasonal-campaign-list", "seasonal-campaign-detail"];

export const dataAPISeasonalCampaign = {
  query: ({ id, page, per_page, search, sort_by, order, status }: SeasonalCampaignListRequest & SeasonalCampaignParams): {
    list: UseApiQueryProps<SeasonalCampaignListResponse>;
    show: UseApiQueryProps<SeasonalCampaignDetailResponse>;
  } => ({
    list: {
      key: [key[0], { page, per_page, search, sort_by, order, status }],
      baseUrl: apiUrl,
      endpoint: "/seasonal-campaigns",
      searchParams: { page, per_page, search, sort_by, order, status },
      placeholderData: keepPreviousData,
    },
    show: {
      key: [key[1], id],
      baseUrl: apiUrl,
      endpoint: `/seasonal-campaigns/${id}`,
      enabled: !!id,
    },
  }),
  mutation: (queryClient?: QueryClient) => {
    const invalidate = async (id?: string) => {
      if (!queryClient) return;
      await invalidateQuery(queryClient, [[key[0]], ...(id ? [[key[1], id]] : [])]);
    };
    const action = (endpoint: string, method: "post" | "put" | "delete" | "patch", title: string): UseMutateConfig<SeasonalCampaignMutationResponse, SeasonalCampaignFormBody | undefined, SeasonalCampaignParams> => ({
      baseUrl: apiUrl,
      endpoint,
      method,
      onSuccess: async ({ data }) => {
        toast.success(data.message);
        await invalidate(data.data?.id);
      },
      onError: { title },
    });
    return {
      create: action("/seasonal-campaigns", "post", "CREATE_SEASONAL_CAMPAIGN"),
      update: action("/seasonal-campaigns/:id", "put", "UPDATE_SEASONAL_CAMPAIGN"),
      publish: action("/seasonal-campaigns/:id/publish", "patch", "PUBLISH_SEASONAL_CAMPAIGN"),
      cancel: action("/seasonal-campaigns/:id/cancel", "patch", "CANCEL_SEASONAL_CAMPAIGN"),
      delete: action("/seasonal-campaigns/:id", "delete", "DELETE_SEASONAL_CAMPAIGN"),
    };
  },
};
