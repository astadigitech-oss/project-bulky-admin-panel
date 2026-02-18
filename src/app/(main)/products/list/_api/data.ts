import { UseApiQueryProps } from "@/lib/query/use-query";
import {
  ChangeStatusProductParams,
  ChangeStatusProductResponse,
  CreateProductBody,
  CreateProductResponse,
  ProductDetailRequest,
  ProductDetailResponse,
  ProductListRequest,
  ProductListResponse,
} from "./types";
import { keepPreviousData, QueryClient } from "@tanstack/react-query";
import { UseMutateConfig } from "@/lib/query/types";
import { toast } from "sonner";
import { invalidateQuery } from "@/lib/query";

const key = ["product-list", "product-detail"];

export const dataAPIProduct = {
  query: ({
    id,
    page,
    per_page,
    search,
    sort_by,
    order,
  }: ProductListRequest & ProductDetailRequest): {
    list: UseApiQueryProps<ProductListResponse>;
    show: UseApiQueryProps<ProductDetailResponse>;
  } => ({
    list: {
      key: [key[0], { page, per_page, search, sort_by, order }],
      endpoint: `/produk`,
      searchParams: { page, per_page, search, sort_by, order },
      placeholderData: keepPreviousData,
    },
    show: {
      key: [key[1], { id }],
      endpoint: `/produk/${id}`,
      enabled: !!id,
    },
  }),
  mutation: (
    queryClient?: QueryClient,
  ): {
    create: UseMutateConfig<CreateProductResponse, CreateProductBody>;
    changeStatus: UseMutateConfig<
      ChangeStatusProductResponse,
      undefined,
      ChangeStatusProductParams
    >;
  } => ({
    create: {
      endpoint: "/produk",
      method: "post",
      onSuccess: async ({ data }) => {
        toast.success(data.message);
        if (queryClient) await invalidateQuery(queryClient, [[key[0]]]);
      },
      onError: { title: "CREATE_PRODUCT" },
    },
    changeStatus: {
      endpoint: "/produk/:id/toggle-status",
      method: "post",
      onSuccess: async ({ data }) => {
        toast.success(data.message);
        if (queryClient)
          await invalidateQuery(queryClient, [
            [key[0]],
            [key[1], data.data.id],
          ]);
      },
      onError: { title: "CREATE_PRODUCT" },
    },
  }),
};
