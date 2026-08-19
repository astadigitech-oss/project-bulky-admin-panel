import { useApiQuery } from "@/lib/query/use-query";
import { dataAPIProduct } from "./data";
import {
  ListWmsCargoRequest,
  ProductDetailRequest,
  ProductListRequest,
} from "./types";
import { useMutate } from "@/lib/query";
import { useQueryClient } from "@tanstack/react-query";

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
