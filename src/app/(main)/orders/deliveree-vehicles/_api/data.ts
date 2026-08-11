import { invalidateQuery } from "@/lib/query";
import { UseMutateConfig } from "@/lib/query/types";
import { UseApiQueryProps } from "@/lib/query/use-query";
import { keepPreviousData, QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  BulkUpdateDelivereeVehicleBody,
  BulkUpdateDelivereeVehicleResponse,
  DelivereeVehicleDetailRequest,
  DelivereeVehicleDetailResponse,
  DelivereeVehicleListRequest,
  DelivereeVehicleListResponse,
  SyncDelivereeVehicleResponse,
  UpdateDelivereeVehicleBody,
  UpdateDelivereeVehicleParams,
  UpdateDelivereeVehicleResponse,
} from "./types";

// query-key
const key = ["deliveree-vehicle-list", "deliveree-vehicle-detail"];

// data
export const dataAPIDelivereeVehicle = {
  query: ({
    id,
    page,
    per_page,
    search,
    sort_by,
    order,
    environment,
  }: DelivereeVehicleListRequest & DelivereeVehicleDetailRequest): {
    list: UseApiQueryProps<DelivereeVehicleListResponse>;
    show: UseApiQueryProps<DelivereeVehicleDetailResponse>;
  } => ({
    list: {
      key: [key[0], { page, per_page, search, sort_by, order, environment }],
      endpoint: `/deliveree-vehicle`,
      searchParams: { page, per_page, search, sort_by, order, environment },
      placeholderData: keepPreviousData,
    },
    show: {
      key: [key[1], id],
      endpoint: `/deliveree-vehicle/${id}`,
      enabled: !!id,
    },
  }),
  mutation: (
    queryClient?: QueryClient,
  ): {
    update: UseMutateConfig<
      UpdateDelivereeVehicleResponse,
      UpdateDelivereeVehicleBody,
      UpdateDelivereeVehicleParams
    >;
    bulkStatus: UseMutateConfig<
      BulkUpdateDelivereeVehicleResponse,
      BulkUpdateDelivereeVehicleBody
    >;
    sync: UseMutateConfig<SyncDelivereeVehicleResponse, undefined>;
  } => ({
    update: {
      endpoint: "/deliveree-vehicle/:id",
      method: "put",
      onSuccess: async ({ data }) => {
        toast.success(data.message);
        if (queryClient)
          await invalidateQuery(queryClient, [
            [key[0]],
            [key[1], data.data.id],
          ]);
      },
      onError: { title: "UPDATE_DELIVEREE_VEHICLE" },
    },
    bulkStatus: {
      endpoint: "/deliveree-vehicle/bulk-status",
      method: "post",
      onSuccess: async ({ data }) => {
        toast.success(data.message);
        if (queryClient) await invalidateQuery(queryClient, [[key[0]]]);
      },
      onError: { title: "BULK_STATUS_DELIVEREE_VEHICLE" },
    },
    sync: {
      endpoint: "/deliveree-vehicle/sync",
      method: "post",
      onSuccess: async ({ data }) => {
        toast.success(data.message);
        if (queryClient) await invalidateQuery(queryClient, [[key[0]]]);
      },
      onError: { title: "SYNC_DELIVEREE_VEHICLE" },
    },
  }),
};
