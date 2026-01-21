import { invalidateQuery } from "@/lib/query";
import { UseMutateConfig } from "@/lib/query/types";
import { UseApiQueryProps } from "@/lib/query/use-query";
import { keepPreviousData, QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  BrandDetailRequest,
  BrandDetailResponse,
  BrandListRequest,
  BrandListResponse,
  ChangeStatusBrandParams,
  ChangeStatusBrandResponse,
  CreateBrandBody,
  CreateBrandResponse,
  DeleteBrandParams,
  DeleteBrandResponse,
  UpdateBrandBody,
  UpdateBrandParams,
  UpdateBrandResponse,
} from "./types";

// query-key
const key = ["brand-list", "brand-detail"];

// data
export const dataAPIBrand = {
  query: ({
    id,
    page,
    per_page,
    search,
    sort_by,
    order,
  }: BrandListRequest & BrandDetailRequest): {
    list: UseApiQueryProps<BrandListResponse>;
    show: UseApiQueryProps<BrandDetailResponse>;
  } => ({
    list: {
      key: [key[0], { page, per_page, search, sort_by, order }],
      endpoint: `/merek-produk`,
      searchParams: { page, per_page, search, sort_by, order },
      placeholderData: keepPreviousData,
    },
    show: {
      key: [key[1], id],
      endpoint: `/merek-produk/${id}`,
      enabled: !!id,
    },
  }),
  mutation: (
    queryClient?: QueryClient,
  ): {
    create: UseMutateConfig<CreateBrandResponse, CreateBrandBody>;
    update: UseMutateConfig<
      UpdateBrandResponse,
      UpdateBrandBody,
      UpdateBrandParams
    >;
    delete: UseMutateConfig<DeleteBrandResponse, undefined, DeleteBrandParams>;
    changeStatus: UseMutateConfig<
      ChangeStatusBrandResponse,
      undefined,
      ChangeStatusBrandParams
    >;
  } => ({
    create: {
      endpoint: "/merek-produk",
      method: "post",
      onSuccess: async ({ data }) => {
        toast.success(data.message);
        if (queryClient)
          await invalidateQuery(queryClient, [
            [key[0]],
            [key[1], data.data.id],
          ]);
      },
      onError: { title: "CREATE_BRAND" },
    },
    update: {
      endpoint: "/merek-produk/:id",
      method: "put",
      onSuccess: async ({ data }) => {
        toast.success(data.message);
        if (queryClient)
          await invalidateQuery(queryClient, [
            [key[0]],
            [key[1], data.data.id],
          ]);
      },
      onError: { title: "UPDATE_BRAND" },
    },
    delete: {
      endpoint: "/merek-produk/:id",
      method: "delete",
      onSuccess: async ({ data }) => {
        toast.success(data.message);
        if (queryClient) await invalidateQuery(queryClient, [[key[0]]]);
      },
      onError: { title: "DELETE_BRAND" },
    },
    changeStatus: {
      endpoint: "/merek-produk/:id/toggle-status",
      method: "patch",
      onSuccess: async ({ data }) => {
        toast.success(data.message);
        if (queryClient)
          await invalidateQuery(queryClient, [
            [key[0]],
            [key[1], data.data.id],
          ]);
      },
      onError: { title: "CHANGE_STATUS_BRAND" },
    },
  }),
};
