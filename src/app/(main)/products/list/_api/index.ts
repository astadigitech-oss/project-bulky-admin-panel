import { useApiQuery } from "@/lib/query/use-query";
import { dataAPIProduct } from "./data";
import {
  ListWmsCargoPricedRequest,
  ListWmsCargoRequest,
  ProductDetailRequest,
  ProductListRequest,
} from "./types";
import { useMutate } from "@/lib/query";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { getCookie } from "cookies-next/client";
import { apiUrl, cookiesKey } from "@/config";

export const useGetProductList = ({
  page,
  per_page,
  search,
  sort_by,
  order,
  status,
}: ProductListRequest) =>
  useApiQuery(
    dataAPIProduct.query({
      page,
      per_page,
      search,
      sort_by,
      order,
      status,
    }).list,
  );

export const useGetProductDetail = ({ id }: ProductDetailRequest) =>
  useApiQuery(dataAPIProduct.query({ id }).show);

export const useListWmsCargo = ({
  page,
  limit,
  search,
  enabled,
}: ListWmsCargoRequest & { enabled?: boolean }) =>
  useApiQuery({
    ...dataAPIProduct.query({ page, limit, search }).listWmsCargo,
    enabled,
  });

export const useListWmsCargoPriced = ({
  search,
  enabled,
}: ListWmsCargoPricedRequest & { enabled?: boolean } = {}) =>
  useApiQuery({
    ...dataAPIProduct.query({ search }).listWmsCargoPriced,
    enabled,
  });

export const useCountWmsCargoReadyToPrice = ({
  enabled,
}: { enabled?: boolean } = {}) =>
  useApiQuery({
    ...dataAPIProduct.query({}).countWmsCargoReadyToPrice,
    enabled,
  });

// mutation
export const useCreateProduct = () =>
  useMutate(dataAPIProduct.mutation(useQueryClient()).create);
export const useUpdateProduct = () =>
  useMutate(dataAPIProduct.mutation(useQueryClient()).update);

export const useDeleteProduct = () =>
  useMutate(dataAPIProduct.mutation(useQueryClient()).delete);

export const useChangeStatusProduct = () =>
  useMutate(dataAPIProduct.mutation(useQueryClient()).changeStatus);

export const useChangeSaleProduct = () =>
  useMutate(dataAPIProduct.mutation(useQueryClient()).changeSale);

export const useChangeQcPassProduct = () =>
  useMutate(dataAPIProduct.mutation(useQueryClient()).changeQcPass);

export const useUploadProductImage = () =>
  useMutate(dataAPIProduct.mutation(useQueryClient()).imageUpload);

export const useReorderProductImage = () =>
  useMutate(dataAPIProduct.mutation(useQueryClient()).imageReorder);

export const useDeleteProductImage = () =>
  useMutate(dataAPIProduct.mutation(useQueryClient()).imageDelete);

export const useTestWmsConnection = () =>
  useMutate(dataAPIProduct.mutation(useQueryClient()).testWmsConnection);

export const useSetWmsCargoPrice = () =>
  useMutate(dataAPIProduct.mutation(useQueryClient()).setWmsCargoPrice);

export const useMarkWmsCargoSynced = () =>
  useMutate(dataAPIProduct.mutation(useQueryClient()).markWmsCargoSynced);

export const useUpdateWmsCargoActualPrice = () =>
  useMutate(dataAPIProduct.mutation(useQueryClient()).updateWmsCargoActualPrice);

export const useUpdateWmsProdukActualPrice = () =>
  useMutate(dataAPIProduct.mutation(useQueryClient()).updateWmsProdukActualPrice);

/**
 * Download PDF harga cargo WMS sebagai Blob (proxy dari BE, bukan URL
 * publik) — dipakai untuk mengisi field "Dokumen PDF" form create produk
 * seolah file diupload manual, saat admin memilih cargo dari dropdown.
 */
export const downloadWmsCargoPricingPdf = async (cargoId: string) => {
  const token = getCookie(cookiesKey);
  const res = await axios.get(`${apiUrl}/wms/cargos/${cargoId}/pricing-pdf`, {
    headers: { Authorization: `Bearer ${token}` },
    responseType: "blob",
  });
  return res.data as Blob;
};

/**
 * Mengambil PDF harga paling baru untuk produk yang sudah tersimpan di Bulky.
 * Endpoint BE akan resolve produk lalu memakai id_cargo yang tersimpan untuk
 * meminta dokumen terbaru dari WMS.
 */
export const downloadProductPricingPdf = async (productId: string) => {
  const token = getCookie(cookiesKey);
  const res = await axios.get(`${apiUrl}/produk/${productId}/pricing-pdf`, {
    headers: { Authorization: `Bearer ${token}` },
    responseType: "blob",
  });
  return res.data as Blob;
};

/**
 * Generate ulang PDF harga terbaru di halaman edit produk. BE menetapkan ulang
 * harga cargo WMS (type "fix", value = harga_sesudah_diskon dari form) lewat
 * POST /api/integration/cargos/{id}/price, lalu mengunduh PDF hasil render
 * ulang menggunakan pricing_pdf_url dari respons — dikembalikan sebagai Blob
 * (proxy dari BE), FE memperlakukannya sebagai dokumen produk.
 */
export const refreshProductPricingPdf = async (
  productId: string,
  value: number,
) => {
  const token = getCookie(cookiesKey);
  const res = await axios.post(
    `${apiUrl}/produk/${productId}/refresh-pricing-pdf`,
    { value },
    { headers: { Authorization: `Bearer ${token}` }, responseType: "blob" },
  );
  return res.data as Blob;
};
