import { invalidateQuery } from "@/lib/query";
import { UseMutateConfig } from "@/lib/query/types";
import { UseApiQueryProps } from "@/lib/query/use-query";
import { keepPreviousData, QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  SourceDetailRequest,
  SourceDetailResponse,
  SourceListRequest,
  SourceListResponse,
  ChangeStatusSourceParams,
  ChangeStatusSourceResponse,
  CreateSourceBody,
  CreateSourceResponse,
  DeleteSourceParams,
  DeleteSourceResponse,
  UpdateSourceBody,
  UpdateSourceParams,
  UpdateSourceResponse,
} from "./types";

// query-key
const key = ["source-product-list", "source-product-detail"];

// data
export const dataAPISource = {
  query: ({
    id,
    page,
    per_page,
    search,
    sort_by,
    order,
  }: SourceListRequest & SourceDetailRequest): {
    list: UseApiQueryProps<SourceListResponse>;
    show: UseApiQueryProps<SourceDetailResponse>;
  } => ({
    list: {
      key: [key[0], { page, per_page, search, sort_by, order }],
      endpoint: `/sumber-produk`,
      searchParams: { page, per_page, search, sort_by, order },
      placeholderData: keepPreviousData,
    },
    show: {
      key: [key[1], id],
      endpoint: `/sumber-produk/${id}`,
      enabled: !!id,
    },
  }),
  mutation: (
    queryClient?: QueryClient,
  ): {
    create: UseMutateConfig<CreateSourceResponse, CreateSourceBody>;
    update: UseMutateConfig<
      UpdateSourceResponse,
      UpdateSourceBody,
      UpdateSourceParams
    >;
    delete: UseMutateConfig<
      DeleteSourceResponse,
      undefined,
      DeleteSourceParams
    >;
    changeStatus: UseMutateConfig<
      ChangeStatusSourceResponse,
      undefined,
      ChangeStatusSourceParams
    >;
  } => ({
    create: {
      endpoint: "/sumber-produk",
      method: "post",
      onSuccess: async ({ data }) => {
        toast.success(data.message);
        if (queryClient)
          await invalidateQuery(queryClient, [
            [key[0]],
            [key[1], data.data.id],
          ]);
      },
      onError: { title: "CREATE_SOURCE" },
    },
    update: {
      endpoint: "/sumber-produk/:id",
      method: "put",
      onSuccess: async ({ data }) => {
        toast.success(data.message);
        if (queryClient)
          await invalidateQuery(queryClient, [
            [key[0]],
            [key[1], data.data.id],
          ]);
      },
      onError: { title: "UPDATE_SOURCE" },
    },
    delete: {
      endpoint: "/sumber-produk/:id",
      method: "delete",
      onSuccess: async ({ data }) => {
        toast.success(data.message);
        if (queryClient) await invalidateQuery(queryClient, [[key[0]]]);
      },
      onError: { title: "DELETE_SOURCE" },
    },
    changeStatus: {
      endpoint: "/sumber-produk/:id/toggle-status",
      method: "patch",
      onSuccess: async ({ data }) => {
        toast.success(data.message);
        if (queryClient)
          await invalidateQuery(queryClient, [
            [key[0]],
            [key[1], data.data.id],
          ]);
      },
      onError: { title: "CHANGE_STATUS_SOURCE" },
    },
  }),
};
