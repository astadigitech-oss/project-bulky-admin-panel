import { invalidateQuery } from "@/lib/query";
import { UseMutateConfig } from "@/lib/query/types";
import { UseApiQueryProps } from "@/lib/query/use-query";
import { keepPreviousData, QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ChangeStatusForceUpdateParams,
  ChangeStatusForceUpdateResponse,
  CreateForceUpdateBody,
  CreateForceUpdateResponse,
  DeleteForceUpdateParams,
  DeleteForceUpdateResponse,
  ForceUpdateDetailRequest,
  ForceUpdateDetailResponse,
  ForceUpdateListRequest,
  ForceUpdateListResponse,
  UpdateForceUpdateBody,
  UpdateForceUpdateParams,
  UpdateForceUpdateResponse,
} from "./types";

// query-key
const key = ["ForceUpdate-list", "ForceUpdate-detail"];

// data
export const dataAPIForceUpdate = {
  query: ({
    id,
    page,
    per_page,
    search,
    sort_by,
    order,
    platform,
  }: ForceUpdateListRequest & ForceUpdateDetailRequest): {
    list: UseApiQueryProps<ForceUpdateListResponse>;
    show: UseApiQueryProps<ForceUpdateDetailResponse>;
  } => ({
    list: {
      key: [key[0], { page, per_page, search, sort_by, order, platform }],
      endpoint: `/force-update`,
      searchParams: { page, per_page, search, sort_by, order, platform },
      placeholderData: keepPreviousData,
    },
    show: {
      key: [key[1], id],
      endpoint: `/force-update/${id}`,
      enabled: !!id,
    },
  }),
  mutation: (
    queryClient?: QueryClient,
  ): {
    create: UseMutateConfig<CreateForceUpdateResponse, CreateForceUpdateBody>;
    update: UseMutateConfig<
      UpdateForceUpdateResponse,
      UpdateForceUpdateBody,
      UpdateForceUpdateParams
    >;
    delete: UseMutateConfig<
      DeleteForceUpdateResponse,
      undefined,
      DeleteForceUpdateParams
    >;
    setActive: UseMutateConfig<
      ChangeStatusForceUpdateResponse,
      undefined,
      ChangeStatusForceUpdateParams
    >;
  } => ({
    create: {
      endpoint: "/force-update",
      method: "post",
      onSuccess: async ({ data }) => {
        toast.success(data.message);
        if (queryClient)
          await invalidateQuery(queryClient, [
            [key[0]],
            [key[1], data.data.id],
          ]);
      },
      onError: { title: "CREATE_FORCE_UPDATE" },
    },
    update: {
      endpoint: "/force-update/:id",
      method: "put",
      onSuccess: async ({ data }) => {
        toast.success(data.message);
        if (queryClient)
          await invalidateQuery(queryClient, [
            [key[0]],
            [key[1], data.data.id],
          ]);
      },
      onError: { title: "UPDATE_FORCE_UPDATE" },
    },
    delete: {
      endpoint: "/force-update/:id",
      method: "delete",
      onSuccess: async ({ data }) => {
        toast.success(data.message);
        if (queryClient) await invalidateQuery(queryClient, [[key[0]]]);
      },
      onError: { title: "DELETE_FORCE_UPDATE" },
    },
    setActive: {
      endpoint: "/force-update/:id/set-active",
      method: "post",
      onSuccess: async ({ data }) => {
        toast.success(data.message);
        if (queryClient) await invalidateQuery(queryClient, [[key[0]]]);
      },
      onError: { title: "CHANGE_STATUS_FORCE_UPDATE" },
    },
  }),
};
