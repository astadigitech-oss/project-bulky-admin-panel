import { UseApiQueryProps } from "@/lib/query/use-query";
import {
  ChangeQcPassProductParams,
  ChangeQcPassProductResponse,
  ChangeSaleProductParams,
  ChangeSaleProductResponse,
  ChangeStatusProductParams,
  ChangeStatusProductResponse,
  CountWmsCargoReadyToPriceResponse,
  CreateProductBody,
  CreateProductResponse,
  DeleteProductImageParams,
  DeleteProductImageResponse,
  DeleteProductParams,
  DeleteProductResponse,
  ListWmsCargoPricedRequest,
  ListWmsCargoPricedResponse,
  ListWmsCargoRequest,
  ListWmsCargoResponse,
  MarkWmsCargoSyncedParams,
  MarkWmsCargoSyncedResponse,
  ProductDetailRequest,
  ProductDetailResponse,
  ProductListRequest,
  ProductListResponse,
  ReorderProductImageBody,
  ReorderProductImageParams,
  ReorderProductImageResponse,
  SetWmsCargoPriceBody,
  SetWmsCargoPriceParams,
  SetWmsCargoPriceResponse,
  TestWmsConnectionResponse,
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

const key = [
  "product-list",
  "product-detail",
  "wms-cargo-ready-to-price",
  "wms-cargo-already-priced",
  "wms-cargo-ready-to-price-count",
];

export const dataAPIProduct = {
  query: ({
    id,
    page,
    per_page,
    search,
    sort_by,
    order,
    status,
    limit,
  }: ProductListRequest &
    ProductDetailRequest &
    ListWmsCargoRequest &
    ListWmsCargoPricedRequest & { search?: string }): {
    list: UseApiQueryProps<ProductListResponse>;
    show: UseApiQueryProps<ProductDetailResponse>;
    listWmsCargo: UseApiQueryProps<ListWmsCargoResponse>;
    listWmsCargoPriced: UseApiQueryProps<ListWmsCargoPricedResponse>;
    countWmsCargoReadyToPrice: UseApiQueryProps<CountWmsCargoReadyToPriceResponse>;
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
    listWmsCargo: {
      key: [key[2], { page, limit, search }],
      endpoint: `/wms/cargos/ready-to-price`,
      searchParams: { page, limit, search },
      placeholderData: keepPreviousData,
      staleTime: 0,
      refetchOnWindowFocus: false,
    },
    listWmsCargoPriced: {
      key: [key[3], { search }],
      endpoint: `/wms/cargos/already-priced`,
      searchParams: { search },
      placeholderData: keepPreviousData,
      staleTime: 0,
      refetchOnWindowFocus: false,
    },
    countWmsCargoReadyToPrice: {
      key: [key[4]],
      endpoint: `/wms/cargos/ready-to-price/count`,
      staleTime: 0,
      refetchOnWindowFocus: false,
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
    changeQcPass: UseMutateConfig<
      ChangeQcPassProductResponse,
      undefined,
      ChangeQcPassProductParams
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
    testWmsConnection: UseMutateConfig<TestWmsConnectionResponse>;
    setWmsCargoPrice: UseMutateConfig<
      SetWmsCargoPriceResponse,
      SetWmsCargoPriceBody,
      SetWmsCargoPriceParams
    >;
    markWmsCargoSynced: UseMutateConfig<
      MarkWmsCargoSyncedResponse,
      undefined,
      MarkWmsCargoSyncedParams
    >;
  } => ({
    create: {
      endpoint: "/produk",
      method: "post",
      // Toast sukses TIDAK ditampilkan di sini — untuk produk asal cargo WMS,
      // toast baru ditampilkan setelah markWmsCargoSynced sukses (lihat
      // onSubmit di halaman create). invalidateQuery tetap jalan di sini agar
      // daftar produk selalu segar begitu produk tersimpan di DB.
      onSuccess: async () => {
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
    changeQcPass: {
      endpoint: "/produk/:id/toggle-qc-pass",
      method: "patch",
      onSuccess: async ({ data }) => {
        toast.success(data.message);
        if (queryClient)
          await invalidateQuery(queryClient, [
            [key[0]],
            [key[1], data.data.id],
          ]);
      },
      onError: { title: "CHANGE_PRODUCT_QC_PASS" },
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
    testWmsConnection: {
      endpoint: "/wms/test-connection",
      method: "post",
      onError: { title: "TEST_WMS_CONNECTION" },
    },
    setWmsCargoPrice: {
      endpoint: "/wms/cargos/:id/price",
      method: "post",
      onSuccess: async ({ data }) => {
        toast.success(data.message);
        if (queryClient)
          await invalidateQuery(queryClient, [[key[2]], [key[4]]]);
      },
      onError: { title: "SET_WMS_CARGO_PRICE" },
    },
    markWmsCargoSynced: {
      endpoint: "/wms/cargos/:id/status",
      method: "post",
      onSuccess: async () => {
        if (queryClient) await invalidateQuery(queryClient, [[key[3]]]);
      },
      onError: { title: "MARK_WMS_CARGO_SYNCED" },
    },
  }),
};
