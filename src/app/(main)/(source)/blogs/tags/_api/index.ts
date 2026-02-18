import { useApiQuery } from "@/lib/query/use-query";
import { dataAPITagBlog } from "./data";
import { useMutate } from "@/lib/query";
import { useQueryClient } from "@tanstack/react-query";
import { TagBlogDetailRequest, TagBlogListRequest } from "./types";

// query
export const useGetTagBlogList = ({
  page,
  per_page,
  search,
  sort_by,
  order,
}: TagBlogListRequest) =>
  useApiQuery(
    dataAPITagBlog.query({
      page,
      per_page,
      search,
      sort_by,
      order,
    }).list,
  );
export const useGetTagBlogDetail = ({ id }: TagBlogDetailRequest) =>
  useApiQuery(dataAPITagBlog.query({ id }).show);
export const useGetTagBlogSelect = () =>
  useApiQuery(dataAPITagBlog.query({}).select);

// mutation
export const useCreateTagBlog = () =>
  useMutate(dataAPITagBlog.mutation(useQueryClient()).create);
export const useUpdateTagBlog = () =>
  useMutate(dataAPITagBlog.mutation(useQueryClient()).update);
export const useDeleteTagBlog = () =>
  useMutate(dataAPITagBlog.mutation(useQueryClient()).delete);
export const useChangeStatusTagBlog = () =>
  useMutate(dataAPITagBlog.mutation(useQueryClient()).changeStatus);
export const useReorderTagBlog = () =>
  useMutate(dataAPITagBlog.mutation(useQueryClient()).reorder);
