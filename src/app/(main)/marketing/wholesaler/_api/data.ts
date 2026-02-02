import { invalidateQuery } from "@/lib/query";
import { UseMutateConfig } from "@/lib/query/types";
import { UseApiQueryProps } from "@/lib/query/use-query";
import { keepPreviousData, QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  WholesalerMarketingConfigResponse,
  UpdateWholesalerMarketingConfigBody,
  UpdateWholesalerMarketingConfigResponse,
} from "./types";

// query-key
const key = ["wholesaler-config-detail"];

// data
export const dataAPIWholesalerMarketing = {
  query: (): {
    config: UseApiQueryProps<WholesalerMarketingConfigResponse>;
  } => ({
    config: {
      key: [key[0]],
      endpoint: `/formulir-partai-besar/config`,
      placeholderData: keepPreviousData,
    },
  }),
  mutation: (
    queryClient?: QueryClient,
  ): {
    update: UseMutateConfig<
      UpdateWholesalerMarketingConfigResponse,
      UpdateWholesalerMarketingConfigBody
    >;
  } => ({
    update: {
      endpoint: "/formulir-partai-besar/config",
      method: "put",
      onSuccess: async ({ data }) => {
        toast.success(data.message);
        if (queryClient) await invalidateQuery(queryClient, [[key[0]]]);
      },
      onError: { title: "UPDATE_WHOLESALER_CONFIG" },
    },
  }),
};
