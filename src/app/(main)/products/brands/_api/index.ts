import { useApiQuery } from "@/lib/query/use-query";
import { dataAPIBrand } from "./data";
import { useMutate } from "@/lib/query";
import { useQueryClient } from "@tanstack/react-query";
import { BrandDetailRequest, BrandListRequest } from "./types";

// query
export const useGetBrandList = ({
  page,
  per_page,
  search,
  sort_by,
  order,
}: BrandListRequest) =>
  useApiQuery(
    dataAPIBrand.query({
      page,
      per_page,
      search,
      sort_by,
      order,
    }).list,
  );
export const useGetBrandDetail = ({ id }: BrandDetailRequest) =>
  useApiQuery(dataAPIBrand.query({ id }).show);

// mutation
export const useCreateBrand = () =>
  useMutate(dataAPIBrand.mutation(useQueryClient()).create);
export const useUpdateBrand = () =>
  useMutate(dataAPIBrand.mutation(useQueryClient()).update);
export const useDeleteBrand = () =>
  useMutate(dataAPIBrand.mutation(useQueryClient()).delete);
export const useChangeStatusBrand = () =>
  useMutate(dataAPIBrand.mutation(useQueryClient()).changeStatus);
