import { invalidateQuery } from "@/lib/query";
import { UseMutateConfig } from "@/lib/query/types";
import { UseApiQueryProps } from "@/lib/query/use-query";
import { keepPreviousData, QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  WholesalerMarketingConfigResponse,
  UpdateWholesalerMarketingConfigBody,
  UpdateWholesalerMarketingConfigResponse,
  WholesalerMarketingAnggaranResponse,
  UpdateWholesalerMarketingAnggaranResponse,
  UpdateWholesalerMarketingAnggaranBody,
  CreateWholesalerMarketingAnggaranBody,
  CreateWholesalerMarketingAnggaranResponse,
  UpdateWholesalerMarketingAnggaranParams,
  ReorderWholesalerMarketingAnggaranParams,
  ReorderWholesalerMarketingAnggaranResponse,
  ReorderWholesalerMarketingAnggaranBody,
  DeleteWholesalerMarketingAnggaranResponse,
  DeleteWholesalerMarketingAnggaranParams,
} from "./types";

// query-key
const key = ["wholesaler-config-detail", "wholesaler-anggaran-detail"];

// data
export const dataAPIWholesalerMarketing = {
  query: (): {
    config: UseApiQueryProps<WholesalerMarketingConfigResponse>;
    listAnggaran: UseApiQueryProps<WholesalerMarketingAnggaranResponse>;
  } => ({
    config: {
      key: [key[0]],
      endpoint: `/formulir-partai-besar/config`,
      placeholderData: keepPreviousData,
    },
    listAnggaran: {
      key: [key[1]],
      endpoint: `/formulir-partai-besar/anggaran`,
      placeholderData: keepPreviousData,
    },
  }),
  mutation: (
    queryClient?: QueryClient,
  ): {
    updateConfig: UseMutateConfig<
      UpdateWholesalerMarketingConfigResponse,
      UpdateWholesalerMarketingConfigBody
    >;
    createAnggaran: UseMutateConfig<
      CreateWholesalerMarketingAnggaranResponse,
      CreateWholesalerMarketingAnggaranBody
    >;
    updateAnggaran: UseMutateConfig<
      UpdateWholesalerMarketingAnggaranResponse,
      UpdateWholesalerMarketingAnggaranBody,
      UpdateWholesalerMarketingAnggaranParams
    >;
    reorderAnggaran: UseMutateConfig<
      ReorderWholesalerMarketingAnggaranResponse,
      ReorderWholesalerMarketingAnggaranBody,
      ReorderWholesalerMarketingAnggaranParams
    >;
    deleteAnggaran: UseMutateConfig<
      DeleteWholesalerMarketingAnggaranResponse,
      undefined,
      DeleteWholesalerMarketingAnggaranParams
    >;
  } => ({
    updateConfig: {
      endpoint: "/formulir-partai-besar/config",
      method: "put",
      onSuccess: async ({ data }) => {
        toast.success(data.message);
        if (queryClient) await invalidateQuery(queryClient, [[key[0]]]);
      },
      onError: { title: "UPDATE_WHOLESALER_CONFIG" },
    },
    createAnggaran: {
      endpoint: "/formulir-partai-besar/anggaran",
      method: "post",
      onSuccess: async ({ data }) => {
        toast.success(data.message);
        if (queryClient) await invalidateQuery(queryClient, [[key[1]]]);
      },
      onError: { title: "CREATE_WHOLESALER_ANGGARAN" },
    },
    updateAnggaran: {
      endpoint: "/formulir-partai-besar/anggaran/:id",
      method: "put",
      onSuccess: async ({ data }) => {
        toast.success(data.message);
        if (queryClient) await invalidateQuery(queryClient, [[key[1]]]);
      },
      onError: { title: "UPDATE_WHOLESALER_ANGGARAN" },
    },
    reorderAnggaran: {
      endpoint: "/formulir-partai-besar/anggaran/:id/reorder",
      method: "patch",
      onSuccess: async ({ data }) => {
        toast.success(data.message);
        if (queryClient) await invalidateQuery(queryClient, [[key[1]]]);
      },
      onError: { title: "REORDER_WHOLESALER_ANGGARAN" },
    },
    deleteAnggaran: {
      endpoint: "/formulir-partai-besar/anggaran/:id",
      method: "delete",
      onSuccess: async ({ data }) => {
        toast.success(data.message);
        if (queryClient) await invalidateQuery(queryClient, [[key[1]]]);
      },
      onError: { title: "DELETE_WHOLESALER_ANGGARAN" },
    },
  }),
};
