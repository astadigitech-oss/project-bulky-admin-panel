import { useApiQuery } from "@/lib/query/use-query";
import { dataAPIVideoCategory } from "./data";
import { useMutate } from "@/lib/query";
import { useQueryClient } from "@tanstack/react-query";
import { VideoCategoryDetailRequest, VideoCategoryListRequest } from "./types";

export const useGetVideoCategoryList = ({
  page,
  per_page,
  search,
  sort_by,
  order,
}: VideoCategoryListRequest) =>
  useApiQuery(
    dataAPIVideoCategory.query({ page, per_page, search, sort_by, order }).list,
  );

export const useGetVideoCategoryDetail = ({ id }: VideoCategoryDetailRequest) =>
  useApiQuery(dataAPIVideoCategory.query({ id }).show);

export const useGetVideoCategorySelect = () =>
  useApiQuery(dataAPIVideoCategory.query({}).select);

export const useCreateVideoCategory = () =>
  useMutate(dataAPIVideoCategory.mutation(useQueryClient()).create);

export const useUpdateVideoCategory = () =>
  useMutate(dataAPIVideoCategory.mutation(useQueryClient()).update);

export const useDeleteVideoCategory = () =>
  useMutate(dataAPIVideoCategory.mutation(useQueryClient()).delete);

export const useToggleStatusVideoCategory = () =>
  useMutate(dataAPIVideoCategory.mutation(useQueryClient()).toggleStatus);

export const useReorderVideoCategory = () =>
  useMutate(dataAPIVideoCategory.mutation(useQueryClient()).reorder);
