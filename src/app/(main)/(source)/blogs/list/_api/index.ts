import { useApiQuery } from "@/lib/query/use-query";
import { dataAPIBlog } from "./data";
import { useMutate } from "@/lib/query";
import { useQueryClient } from "@tanstack/react-query";
import { BlogDetailRequest, BlogListRequest } from "./types";

export const useGetBlogList = ({
  page,
  per_page,
  search,
  sort_by,
  order,
}: BlogListRequest) =>
  useApiQuery(dataAPIBlog.query({ page, per_page, search, sort_by, order }).list);

export const useGetBlogDetail = ({ id }: BlogDetailRequest) =>
  useApiQuery(dataAPIBlog.query({ id }).show);

export const useCreateBlog = () =>
  useMutate(dataAPIBlog.mutation(useQueryClient()).create);

export const useUpdateBlog = () =>
  useMutate(dataAPIBlog.mutation(useQueryClient()).update);

export const useDeleteBlog = () =>
  useMutate(dataAPIBlog.mutation(useQueryClient()).delete);

export const useToggleStatusBlog = () =>
  useMutate(dataAPIBlog.mutation(useQueryClient()).toggleStatus);
