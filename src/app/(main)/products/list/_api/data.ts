import { UseApiQueryProps } from "@/lib/query/use-query";
import {
  ChangeSaleProductParams,
  ChangeSaleProductResponse,
  ChangeStatusProductParams,
  ChangeStatusProductResponse,
  CreateProductBody,
  CreateProductResponse,
  DeleteProductImageParams,
  DeleteProductImageResponse,
  DeleteProductParams,
  DeleteProductResponse,
  ProductDetailRequest,
  ProductDetailResponse,
  ProductListRequest,
  ProductListResponse,
  ReorderProductImageBody,
  ReorderProductImageParams,
  ReorderProductImageResponse,
  UpdateProductBody,
  UpdateProductParams,
  UpdateProductResponse,
  UploadProductImageBody,
  UploadProductImageParams,
  UploadProductImageResponse,
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
    status,
  }: ProductListRequest & ProductDetailRequest): {
    list: UseApiQueryProps<ProductListResponse>;
    show: UseApiQueryProps<ProductDetailResponse>;
  } => ({
    list: {
      key: [key[0], { page, per_page, search, sort_by, order, status }],
      endpoint: `/produk`,
      searchParams: { page, per_page, search, sort_by, order, status },
      placeholderData: keepPreviousData,
    },
    show: {
      key: [key[1], id],
      endpoint: `/produk/${id}`,
      enabled: !!id,
    },
  }),
  mutation: (
    queryClient?: QueryClient,
  ): {
    create: UseMutateConfig<CreateProductResponse, CreateProductBody>;
    update: UseMutateConfig<
      UpdateProductResponse,
      UpdateProductBody,
      UpdateProductParams
    >;
    delete: UseMutateConfig<
      DeleteProductResponse,
      undefined,
      DeleteProductParams
    >;
    changeStatus: UseMutateConfig<
      ChangeStatusProductResponse,
      undefined,
      ChangeStatusProductParams
    >;
    changeSale: UseMutateConfig<
      ChangeSaleProductResponse,
      undefined,
      ChangeSaleProductParams
    >;
    imageUpload: UseMutateConfig<
      UploadProductImageResponse,
      UploadProductImageBody,
      UploadProductImageParams
    >;
    imageReorder: UseMutateConfig<
      ReorderProductImageResponse,
      ReorderProductImageBody,
      ReorderProductImageParams
    >;
    imageDelete: UseMutateConfig<
      DeleteProductImageResponse,
      undefined,
      DeleteProductImageParams
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
    update: {
      endpoint: "/produk/:id",
      method: "put",
      onSuccess: async ({ data }) => {
        toast.success(data.message);
        if (queryClient)
          await invalidateQuery(queryClient, [
            [key[0]],
            [key[1], data.data.id],
          ]);
      },
      onError: { title: "UPDATE_PRODUCT" },
    },
    delete: {
      endpoint: "/produk/:id",
      method: "delete",
      onSuccess: async ({ data }) => {
        toast.success(data.message);
        if (queryClient) await invalidateQuery(queryClient, [[key[0]]]);
      },
      onError: { title: "DELETE_PRODUCT" },
    },
    changeStatus: {
      endpoint: "/produk/:id/toggle-status",
      method: "patch",
      onSuccess: async ({ data }) => {
        toast.success(data.message);
        if (queryClient)
          await invalidateQuery(queryClient, [
            [key[0]],
            [key[1], data.data.id],
          ]);
      },
      onError: { title: "CHANGE_PRODUCT_STATUS" },
    },
    changeSale: {
      endpoint: "/produk/:id/toggle-sale",
      method: "patch",
      onSuccess: async ({ data }) => {
        toast.success(data.message);
        if (queryClient)
          await invalidateQuery(queryClient, [
            [key[0]],
            [key[1], data.data.id],
          ]);
      },
      onError: { title: "CHANGE_PRODUCT_SALE" },
    },
    imageUpload: {
      endpoint: "/produk/:id/gambar",
      method: "post",
      onSuccess: async ({ data }) => {
        toast.success(data.message);
      },
      onError: { title: "UPLOAD_PRODUCT_IMAGE" },
    },
    imageReorder: {
      endpoint: "/produk/:id/gambar/:imageId/reorder",
      method: "patch",
      onSuccess: async ({ data }) => {
        toast.success(data.message);
      },
      onError: { title: "REORDER_PRODUCT_IMAGE" },
    },
    imageDelete: {
      endpoint: "/produk/:id/gambar/:imageId",
      method: "delete",
      onSuccess: async ({ data }) => {
        toast.success(data.message);
      },
      onError: { title: "DELETE_PRODUCT_IMAGE" },
    },
  }),
};
