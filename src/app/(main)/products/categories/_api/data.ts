import { invalidateQuery } from "@/lib/query";
import { UseMutateConfig } from "@/lib/query/types";
import { UseApiQueryProps } from "@/lib/query/use-query";
import { keepPreviousData, QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  CategoryDetailRequest,
  CategoryDetailResponse,
  CategoryListRequest,
  CategoryListResponse,
  ChangeStatusCategoryParams,
  ChangeStatusCategoryResponse,
  CreateCategoryBody,
  CreateCategoryResponse,
  DeleteCategoryParams,
  DeleteCategoryResponse,
  UpdateCategoryBody,
  UpdateCategoryParams,
  UpdateCategoryResponse,
} from "./types";

// query-key
const key = ["category-list", "category-detail"];

// data
export const dataAPICategory = {
  query: ({
    id,
    page,
    per_page,
    search,
    sort_by,
    order,
  }: CategoryListRequest & CategoryDetailRequest): {
    list: UseApiQueryProps<CategoryListResponse>;
    show: UseApiQueryProps<CategoryDetailResponse>;
  } => ({
    list: {
      key: [key[0], { page, per_page, search, sort_by, order }],
      endpoint: `/kategori-produk`,
      searchParams: { page, per_page, search, sort_by, order },
      placeholderData: keepPreviousData,
    },
    show: {
      key: [key[1], id],
      endpoint: `/kategori-produk/${id}`,
      enabled: !!id,
    },
  }),
  mutation: (
    queryClient?: QueryClient,
  ): {
    create: UseMutateConfig<CreateCategoryResponse, CreateCategoryBody>;
    update: UseMutateConfig<
      UpdateCategoryResponse,
      UpdateCategoryBody,
      UpdateCategoryParams
    >;
    delete: UseMutateConfig<
      DeleteCategoryResponse,
      undefined,
      DeleteCategoryParams
    >;
    changeStatus: UseMutateConfig<
      ChangeStatusCategoryResponse,
      undefined,
      ChangeStatusCategoryParams
    >;
  } => ({
    create: {
      endpoint: "/kategori-produk",
      method: "post",
      onSuccess: async ({ data }) => {
        toast.success(data.message);
        if (queryClient)
          await invalidateQuery(queryClient, [
            [key[0]],
            [key[1], data.data.id],
          ]);
      },
      onError: { title: "CREATE_CATEGORY" },
    },
    update: {
      endpoint: "/kategori-produk/:id",
      method: "put",
      onSuccess: async ({ data }) => {
        toast.success(data.message);
        if (queryClient)
          await invalidateQuery(queryClient, [
            [key[0]],
            [key[1], data.data.id],
          ]);
      },
      onError: { title: "UPDATE_CATEGORY" },
    },
    delete: {
      endpoint: "/kategori-produk/:id",
      method: "delete",
      onSuccess: async ({ data }) => {
        toast.success(data.message);
        if (queryClient) await invalidateQuery(queryClient, [[key[0]]]);
      },
      onError: { title: "DELETE_CATEGORY" },
    },
    changeStatus: {
      endpoint: "/kategori-produk/:id/toggle-status",
      method: "patch",
      onSuccess: async ({ data }) => {
        toast.success(data.message);
        if (queryClient)
          await invalidateQuery(queryClient, [
            [key[0]],
            [key[1], data.data.id],
          ]);
      },
      onError: { title: "CHANGE_STATUS_CATEGORY" },
    },
  }),
};
