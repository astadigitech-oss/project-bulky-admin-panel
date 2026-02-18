import { invalidateQuery } from "@/lib/query";
import { UseMutateConfig } from "@/lib/query/types";
import { UseApiQueryProps } from "@/lib/query/use-query";
import { keepPreviousData, QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ProductConditionDetailRequest,
  ProductConditionDetailResponse,
  ProductConditionListRequest,
  ProductConditionListResponse,
  ChangeStatusProductConditionParams,
  ChangeStatusProductConditionResponse,
  CreateProductConditionBody,
  CreateProductConditionResponse,
  DeleteProductConditionParams,
  DeleteProductConditionResponse,
  UpdateProductConditionBody,
  UpdateProductConditionParams,
  UpdateProductConditionResponse,
  ReorderProductConditionResponse,
  ReorderProductConditionParams,
  ReorderProductConditionBody,
  ProductConditionSelectResponse,
} from "./types";

// query-key
const key = [
  "condition-product-list",
  "condition-product-detail",
  "condition-product-select",
];

// data
export const dataAPIProductCondition = {
  query: ({
    id,
    page,
    per_page,
    search,
    sort_by,
    order,
  }: ProductConditionListRequest & ProductConditionDetailRequest): {
    list: UseApiQueryProps<ProductConditionListResponse>;
    show: UseApiQueryProps<ProductConditionDetailResponse>;
    select: UseApiQueryProps<ProductConditionSelectResponse>;
  } => ({
    list: {
      key: [key[0], { page, per_page, search, sort_by, order }],
      endpoint: `/kondisi-produk`,
      searchParams: { page, per_page, search, sort_by, order },
      placeholderData: keepPreviousData,
    },
    show: {
      key: [key[1], id],
      endpoint: `/kondisi-produk/${id}`,
      enabled: !!id,
    },
    select: {
      key: [key[2]],
      endpoint: `/kondisi-produk/dropdown`,
    },
  }),
  mutation: (
    queryClient?: QueryClient,
  ): {
    create: UseMutateConfig<
      CreateProductConditionResponse,
      CreateProductConditionBody
    >;
    update: UseMutateConfig<
      UpdateProductConditionResponse,
      UpdateProductConditionBody,
      UpdateProductConditionParams
    >;
    delete: UseMutateConfig<
      DeleteProductConditionResponse,
      undefined,
      DeleteProductConditionParams
    >;
    changeStatus: UseMutateConfig<
      ChangeStatusProductConditionResponse,
      undefined,
      ChangeStatusProductConditionParams
    >;
    reorder: UseMutateConfig<
      ReorderProductConditionResponse,
      ReorderProductConditionBody,
      ReorderProductConditionParams
    >;
  } => ({
    create: {
      endpoint: "/kondisi-produk",
      method: "post",
      onSuccess: async ({ data }) => {
        toast.success(data.message);
        if (queryClient)
          await invalidateQuery(queryClient, [
            [key[0]],
            [key[2]],
            [key[1], data.data.id],
          ]);
      },
      onError: { title: "CREATE_PRODUCT_CONDITION" },
    },
    update: {
      endpoint: "/kondisi-produk/:id",
      method: "put",
      onSuccess: async ({ data }) => {
        toast.success(data.message);
        if (queryClient)
          await invalidateQuery(queryClient, [
            [key[0]],
            [key[2]],
            [key[1], data.data.id],
          ]);
      },
      onError: { title: "UPDATE_PRODUCT_CONDITION" },
    },
    delete: {
      endpoint: "/kondisi-produk/:id",
      method: "delete",
      onSuccess: async ({ data }) => {
        toast.success(data.message);
        if (queryClient)
          await invalidateQuery(queryClient, [[key[0]], [key[2]]]);
      },
      onError: { title: "DELETE_PRODUCT_CONDITION" },
    },
    changeStatus: {
      endpoint: "/kondisi-produk/:id/toggle-status",
      method: "patch",
      onSuccess: async ({ data }) => {
        toast.success(data.message);
        if (queryClient)
          await invalidateQuery(queryClient, [
            [key[0]],
            [key[2]],
            [key[1], data.data.id],
          ]);
      },
      onError: { title: "CHANGE_STATUS_PRODUCT_CONDITION" },
    },
    reorder: {
      endpoint: "/kondisi-produk/:id/reorder",
      method: "patch",
      onSuccess: async ({ data }) => {
        toast.success(data.message);
        if (queryClient)
          await invalidateQuery(queryClient, [
            [key[0]],
            [key[2]],
            [key[1], data.data.item.id],
            [key[1], data.data.swapped_with.id],
          ]);
      },
      onError: { title: "REORDER_PRODUCT_CONDITION" },
    },
  }),
};
