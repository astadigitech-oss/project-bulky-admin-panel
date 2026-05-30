import { useApiQuery } from "@/lib/query/use-query";
import { dataAPIBlogCategory } from "./data";
import { useMutate } from "@/lib/query";
import { useQueryClient } from "@tanstack/react-query";
import { BlogCategoryDetailRequest, BlogCategoryListRequest } from "./types";

export const useGetBlogCategoryList = ({
  page,
  per_page,
  search,
  sort_by,
  order,
}: BlogCategoryListRequest) =>
  useApiQuery(
    dataAPIBlogCategory.query({ page, per_page, search, sort_by, order }).list,
  );

export const useGetBlogCategoryDetail = ({ id }: BlogCategoryDetailRequest) =>
  useApiQuery(dataAPIBlogCategory.query({ id }).show);

export const useGetBlogCategorySelect = () =>
  useApiQuery(dataAPIBlogCategory.query({}).select);

export const useCreateBlogCategory = () =>
  useMutate(dataAPIBlogCategory.mutation(useQueryClient()).create);

export const useUpdateBlogCategory = () =>
  useMutate(dataAPIBlogCategory.mutation(useQueryClient()).update);

export const useDeleteBlogCategory = () =>
  useMutate(dataAPIBlogCategory.mutation(useQueryClient()).delete);

export const useToggleStatusBlogCategory = () =>
  useMutate(dataAPIBlogCategory.mutation(useQueryClient()).toggleStatus);

export const useReorderBlogCategory = () =>
  useMutate(dataAPIBlogCategory.mutation(useQueryClient()).reorder);
