import { invalidateQuery } from "@/lib/query";
import { UseMutateConfig } from "@/lib/query/types";
import { UseApiQueryProps } from "@/lib/query/use-query";
import { keepPreviousData, QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ChangeStatusMaintenanceParams,
  ChangeStatusMaintenanceResponse,
  CreateMaintenanceBody,
  CreateMaintenanceResponse,
  DeleteMaintenanceParams,
  DeleteMaintenanceResponse,
  MaintenanceDetailRequest,
  MaintenanceDetailResponse,
  MaintenanceListRequest,
  MaintenanceListResponse,
  UpdateMaintenanceBody,
  UpdateMaintenanceParams,
  UpdateMaintenanceResponse,
} from "./types";

// query-key
const key = ["maintenance-list", "maintenance-detail"];

// data
export const dataAPIMaintenance = {
  query: ({
    id,
    page,
    per_page,
    search,
    sort_by,
    order,
  }: MaintenanceListRequest & MaintenanceDetailRequest): {
    list: UseApiQueryProps<MaintenanceListResponse>;
    show: UseApiQueryProps<MaintenanceDetailResponse>;
  } => ({
    list: {
      key: [key[0], { page, per_page, search, sort_by, order }],
      endpoint: `/mode-maintenance`,
      searchParams: { page, per_page, search, sort_by, order },
      placeholderData: keepPreviousData,
    },
    show: {
      key: [key[1], id],
      endpoint: `/mode-maintenance/${id}`,
      enabled: !!id,
    },
  }),
  mutation: (
    queryClient?: QueryClient,
  ): {
    create: UseMutateConfig<CreateMaintenanceResponse, CreateMaintenanceBody>;
    update: UseMutateConfig<
      UpdateMaintenanceResponse,
      UpdateMaintenanceBody,
      UpdateMaintenanceParams
    >;
    delete: UseMutateConfig<
      DeleteMaintenanceResponse,
      undefined,
      DeleteMaintenanceParams
    >;
    activate: UseMutateConfig<
      ChangeStatusMaintenanceResponse,
      undefined,
      ChangeStatusMaintenanceParams
    >;
    deactivate: UseMutateConfig<
      ChangeStatusMaintenanceResponse,
      undefined,
      ChangeStatusMaintenanceParams
    >;
  } => ({
    create: {
      endpoint: "/mode-maintenance",
      method: "post",
      onSuccess: async ({ data }) => {
        toast.success(data.message);
        if (queryClient)
          await invalidateQuery(queryClient, [
            [key[0]],
            [key[1], data.data.id],
          ]);
      },
      onError: { title: "CREATE_MAINTENANCE" },
    },
    update: {
      endpoint: "/mode-maintenance/:id",
      method: "put",
      onSuccess: async ({ data }) => {
        toast.success(data.message);
        if (queryClient)
          await invalidateQuery(queryClient, [
            [key[0]],
            [key[1], data.data.id],
          ]);
      },
      onError: { title: "UPDATE_MAINTENANCE" },
    },
    delete: {
      endpoint: "/mode-maintenance/:id",
      method: "delete",
      onSuccess: async ({ data }) => {
        toast.success(data.message);
        if (queryClient) await invalidateQuery(queryClient, [[key[0]]]);
      },
      onError: { title: "DELETE_MAINTENANCE" },
    },
    activate: {
      endpoint: "/mode-maintenance/:id/activate",
      method: "post",
      onSuccess: async ({ data }) => {
        toast.success(data.message);
        if (queryClient) await invalidateQuery(queryClient, [[key[0]]]);
      },
      onError: { title: "CHANGE_STATUS_MAINTENANCE" },
    },
    deactivate: {
      endpoint: "/mode-maintenance/:id/deactivate",
      method: "post",
      onSuccess: async ({ data }) => {
        toast.success(data.message);
        if (queryClient) await invalidateQuery(queryClient, [[key[0]]]);
      },
      onError: { title: "CHANGE_STATUS_MAINTENANCE" },
    },
  }),
};
