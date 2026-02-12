import { useApiQuery } from "@/lib/query/use-query";
import { dataAPICategory } from "./data";
import { useMutate } from "@/lib/query";
import { useQueryClient } from "@tanstack/react-query";
import { CategoryDetailRequest, CategoryListRequest } from "./types";

// query
export const useGetCategoryList = ({
  page,
  per_page,
  search,
  sort_by,
  order,
}: CategoryListRequest) =>
  useApiQuery(
    dataAPICategory.query({
      page,
      per_page,
      search,
      sort_by,
      order,
    }).list,
  );
export const useGetCategoryDetail = ({ id }: CategoryDetailRequest) =>
  useApiQuery(dataAPICategory.query({ id }).show);
export const useGetCategorySelect = () =>
  useApiQuery(dataAPICategory.query({}).select);

// mutation
export const useCreateCategory = () =>
  useMutate(dataAPICategory.mutation(useQueryClient()).create);
export const useUpdateCategory = () =>
  useMutate(dataAPICategory.mutation(useQueryClient()).update);
export const useDeleteCategory = () =>
  useMutate(dataAPICategory.mutation(useQueryClient()).delete);
export const useChangeStatusCategory = () =>
  useMutate(dataAPICategory.mutation(useQueryClient()).changeStatus);
