import { useApiQuery } from "@/lib/query/use-query";
import { dataAPISource } from "./data";
import { useMutate } from "@/lib/query";
import { useQueryClient } from "@tanstack/react-query";
import { SourceDetailRequest, SourceListRequest } from "./types";

// query
export const useGetSourceList = ({
  page,
  per_page,
  search,
  sort_by,
  order,
}: SourceListRequest) =>
  useApiQuery(
    dataAPISource.query({
      page,
      per_page,
      search,
      sort_by,
      order,
    }).list,
  );
export const useGetSourceDetail = ({ id }: SourceDetailRequest) =>
  useApiQuery(dataAPISource.query({ id }).show);
export const useGetSourceSelect = () =>
  useApiQuery(dataAPISource.query({}).select);

// mutation
export const useCreateSource = () =>
  useMutate(dataAPISource.mutation(useQueryClient()).create);
export const useUpdateSource = () =>
  useMutate(dataAPISource.mutation(useQueryClient()).update);
export const useDeleteSource = () =>
  useMutate(dataAPISource.mutation(useQueryClient()).delete);
export const useChangeStatusSource = () =>
  useMutate(dataAPISource.mutation(useQueryClient()).changeStatus);
