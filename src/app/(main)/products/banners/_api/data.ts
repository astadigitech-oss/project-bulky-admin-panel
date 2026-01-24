import { invalidateQuery } from "@/lib/query";
import { UseMutateConfig } from "@/lib/query/types";
import { UseApiQueryProps } from "@/lib/query/use-query";
import { keepPreviousData, QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  BannerTypeProductDetailRequest,
  BannerTypeProductDetailResponse,
  BannerTypeProductListResponse,
  ChangeStatusBannerTypeProductParams,
  ChangeStatusBannerTypeProductResponse,
  CreateBannerTypeProductBody,
  CreateBannerTypeProductResponse,
  DeleteBannerTypeProductParams,
  DeleteBannerTypeProductResponse,
  ListTypeProductResponse,
  ReorderBannerTypeProductBody,
  ReorderBannerTypeProductParams,
  ReorderBannerTypeProductResponse,
  UpdateBannerTypeProductBody,
  UpdateBannerTypeProductParams,
  UpdateBannerTypeProductResponse,
} from "./types";

// query-key
const key = ["banner-type-product-list", "banner-type-product-detail"];

// data
export const dataAPIBannerTypeProduct = {
  query: ({
    id,
  }: BannerTypeProductDetailRequest): {
    list: UseApiQueryProps<BannerTypeProductListResponse>;
    show: UseApiQueryProps<BannerTypeProductDetailResponse>;
    tipeProduct: UseApiQueryProps<ListTypeProductResponse>;
  } => ({
    list: {
      key: [key[0]],
      endpoint: `/banner-tipe-produk`,
      placeholderData: keepPreviousData,
    },
    show: {
      key: [key[1], id],
      endpoint: `/banner-tipe-produk/${id}`,
      enabled: !!id,
    },
    tipeProduct: {
      key: ["tipe-product"],
      endpoint: `/tipe-produk`,
    },
  }),
  mutation: (
    queryClient?: QueryClient,
  ): {
    create: UseMutateConfig<
      CreateBannerTypeProductResponse,
      CreateBannerTypeProductBody
    >;
    update: UseMutateConfig<
      UpdateBannerTypeProductResponse,
      UpdateBannerTypeProductBody,
      UpdateBannerTypeProductParams
    >;
    delete: UseMutateConfig<
      DeleteBannerTypeProductResponse,
      undefined,
      DeleteBannerTypeProductParams
    >;
    changeStatus: UseMutateConfig<
      ChangeStatusBannerTypeProductResponse,
      undefined,
      ChangeStatusBannerTypeProductParams
    >;
    reorder: UseMutateConfig<
      ReorderBannerTypeProductResponse,
      ReorderBannerTypeProductBody,
      ReorderBannerTypeProductParams
    >;
  } => ({
    create: {
      endpoint: "/banner-tipe-produk",
      method: "post",
      onSuccess: async ({ data }) => {
        toast.success(data.message);
        if (queryClient)
          await invalidateQuery(queryClient, [
            [key[0]],
            [key[1], data.data.id],
          ]);
      },
      onError: { title: "CREATE_BannerTypeProduct" },
    },
    update: {
      endpoint: "/banner-tipe-produk/:id",
      method: "put",
      onSuccess: async ({ data }) => {
        toast.success(data.message);
        if (queryClient)
          await invalidateQuery(queryClient, [
            [key[0]],
            [key[1], data.data.id],
          ]);
      },
      onError: { title: "UPDATE_BannerTypeProduct" },
    },
    delete: {
      endpoint: "/banner-tipe-produk/:id",
      method: "delete",
      onSuccess: async ({ data }) => {
        toast.success(data.message);
        if (queryClient) await invalidateQuery(queryClient, [[key[0]]]);
      },
      onError: { title: "DELETE_BannerTypeProduct" },
    },
    changeStatus: {
      endpoint: "/banner-tipe-produk/:id/toggle-status",
      method: "patch",
      onSuccess: async ({ data }) => {
        toast.success(data.message);
        if (queryClient)
          await invalidateQuery(queryClient, [
            [key[0]],
            [key[1], data.data.id],
          ]);
      },
      onError: { title: "CHANGE_STATUS_BannerTypeProduct" },
    },
    reorder: {
      endpoint: "/banner-tipe-produk/:id/reorder",
      method: "patch",
      onSuccess: async ({ data }) => {
        toast.success(data.message);
        if (queryClient)
          await invalidateQuery(queryClient, [
            [key[0]],
            [key[1], data.data.item.id],
            [key[1], data.data.swapped_with.id],
          ]);
      },
      onError: { title: "CHANGE_STATUS_BannerTypeProduct" },
    },
  }),
};
