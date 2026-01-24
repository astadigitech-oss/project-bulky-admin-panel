import { useApiQuery } from "@/lib/query/use-query";
import { dataAPIBannerTypeProduct } from "./data";
import { useMutate } from "@/lib/query";
import { useQueryClient } from "@tanstack/react-query";
import { BannerTypeProductDetailRequest } from "./types";

// query
export const useGetBannerTypeProductList = () =>
  useApiQuery(dataAPIBannerTypeProduct.query({}).list);
export const useGetBannerTypeProductDetail = ({
  id,
}: BannerTypeProductDetailRequest) =>
  useApiQuery(dataAPIBannerTypeProduct.query({ id }).show);
export const useGetTypeProductList = () =>
  useApiQuery(dataAPIBannerTypeProduct.query({}).tipeProduct);

// mutation
export const useCreateBannerTypeProduct = () =>
  useMutate(dataAPIBannerTypeProduct.mutation(useQueryClient()).create);
export const useUpdateBannerTypeProduct = () =>
  useMutate(dataAPIBannerTypeProduct.mutation(useQueryClient()).update);
export const useDeleteBannerTypeProduct = () =>
  useMutate(dataAPIBannerTypeProduct.mutation(useQueryClient()).delete);
export const useChangeStatusBannerTypeProduct = () =>
  useMutate(dataAPIBannerTypeProduct.mutation(useQueryClient()).changeStatus);
export const useReorderBannerTypeProduct = () =>
  useMutate(dataAPIBannerTypeProduct.mutation(useQueryClient()).reorder);
