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
  UpdateWmsCargoActualPriceBody,
  UpdateWmsCargoActualPriceParams,
  UpdateWmsCargoActualPriceResponse,
  UpdateWmsProdukActualPriceBody,
  UpdateWmsProdukActualPriceParams,
  UpdateWmsProdukActualPriceResponse,
  ProductDetailRequest,
  ProductDetailResponse,
  ProductListRequest,
  ProductListResponse,
  PreviewWmsCargoIDSyncResponse,
  ReorderProductImageBody,
  ReorderProductImageParams,
  ReorderProductImageResponse,
  SetWmsCargoPriceBody,
  SetWmsCargoPriceParams,
  SetWmsCargoPriceResponse,
  SyncWmsCargoIDsRequestBody,
  SyncWmsCargoIDsResponse,
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
  "wms-cargo-id-sync-preview",
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
    previewWmsCargoIDSync: UseApiQueryProps<PreviewWmsCargoIDSyncResponse>;
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
    previewWmsCargoIDSync: {
      key: [key[5]],
      endpoint: `/wms/cargos/sync-ids/preview`,
      enabled: false,
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
    syncWmsCargoIDs: UseMutateConfig<
      SyncWmsCargoIDsResponse,
      SyncWmsCargoIDsRequestBody
    >;
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
    updateWmsCargoActualPrice: UseMutateConfig<
      UpdateWmsCargoActualPriceResponse,
      UpdateWmsCargoActualPriceBody,
      UpdateWmsCargoActualPriceParams
    >;
    updateWmsProdukActualPrice: UseMutateConfig<
      UpdateWmsProdukActualPriceResponse,
      UpdateWmsProdukActualPriceBody,
      UpdateWmsProdukActualPriceParams
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
    syncWmsCargoIDs: {
      endpoint: "/wms/cargos/sync-ids",
      method: "post",
      onSuccess: async ({ data }) => {
        const result = data.data;
        const summary = data.message + ": " + result.updated + " diperbarui dari " + result.selected + " dipilih, " + result.not_selected + " dilewati, " + result.failed + " gagal.";
        if (result.not_found > 0 || result.failed > 0) {
          toast.warning(summary);
        } else {
          toast.success(summary);
        }
        if (queryClient) await invalidateQuery(queryClient, [[key[0]]]);
      },
      onError: { title: "SYNC_WMS_CARGO_IDS" },
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
    updateWmsCargoActualPrice: {
      endpoint: "/wms/cargos/:id/actual-price",
      method: "post",
      onSuccess: async ({ data }) => {
        toast.success(data.message);
      },
      onError: { title: "UPDATE_WMS_CARGO_ACTUAL_PRICE" },
    },
    updateWmsProdukActualPrice: {
      endpoint: "/wms/produk/:id/actual-price",
      method: "post",
      onSuccess: async ({ data }) => {
        toast.success(data.message);
      },
      onError: { title: "UPDATE_WMS_PRODUK_ACTUAL_PRICE" },
    },
  }),
};
