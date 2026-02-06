import { invalidateQuery } from "@/lib/query";
import { UseMutateConfig } from "@/lib/query/types";
import { UseApiQueryProps } from "@/lib/query/use-query";
import { keepPreviousData, QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  BuyHelpDetailResponse,
  UpdateBuyHelpBody,
  UpdateBuyHelpResponse,
} from "./types";

// query-key
const key = ["buy-help-detail"];

// data
export const dataAPIBuyHelp = {
  query: (): { show: UseApiQueryProps<BuyHelpDetailResponse> } => ({
    show: {
      key: [key[0]],
      endpoint: `/dokumen-kebijakan/cara-membeli`,
      placeholderData: keepPreviousData,
    },
  }),
  mutation: (
    queryClient?: QueryClient,
  ): {
    update: UseMutateConfig<UpdateBuyHelpResponse, UpdateBuyHelpBody>;
  } => ({
    update: {
      endpoint: "/dokumen-kebijakan/cara-membeli",
      method: "put",
      onSuccess: async ({ data }) => {
        toast.success(data.message);
        if (queryClient) await invalidateQuery(queryClient, [[key[0]]]);
      },
      onError: { title: "UPDATE_HOW_TO_BUY" },
    },
  }),
};
