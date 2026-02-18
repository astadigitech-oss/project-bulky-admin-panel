import { useApiQuery } from "@/lib/query/use-query";
import { dataAPIProduct } from "./data";
import { ProductDetailRequest, ProductListRequest } from "./types";
import { useMutate } from "@/lib/query";
import { useQueryClient } from "@tanstack/react-query";

export const useGetProductList = ({
  page,
  per_page,
  search,
  sort_by,
  order,
}: ProductListRequest) =>
  useApiQuery(
    dataAPIProduct.query({
      page,
      per_page,
      search,
      sort_by,
      order,
    }).list,
  );

export const useGetProductDetail = ({ id }: ProductDetailRequest) =>
  useApiQuery(dataAPIProduct.query({ id }).show);

// mutation
export const useCreateProduct = () =>
  useMutate(dataAPIProduct.mutation(useQueryClient()).create);
export const useChangeStatusProduct = () =>
  useMutate(dataAPIProduct.mutation(useQueryClient()).changeStatus);
