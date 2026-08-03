import { useApiQuery } from "@/lib/query/use-query";
import { dataAPIForceUpdate } from "./data";
import { ForceUpdateDetailRequest, ForceUpdateListRequest } from "./types";
import { useMutate } from "@/lib/query";
import { useQueryClient } from "@tanstack/react-query";

// query
export const useGetForceUpdateList = ({
  page,
  per_page,
  search,
  sort_by,
  order,
  platform,
}: ForceUpdateListRequest) =>
  useApiQuery(
    dataAPIForceUpdate.query({
      page,
      per_page,
      search,
      sort_by,
      order,
      platform,
    }).list,
  );
export const useGetForceUpdateDetail = ({ id }: ForceUpdateDetailRequest) =>
  useApiQuery(dataAPIForceUpdate.query({ id }).show);

// mutation
export const useCreateForceUpdate = () =>
  useMutate(dataAPIForceUpdate.mutation(useQueryClient()).create);
export const useUpdateForceUpdate = () =>
  useMutate(dataAPIForceUpdate.mutation(useQueryClient()).update);
export const useDeleteForceUpdate = () =>
  useMutate(dataAPIForceUpdate.mutation(useQueryClient()).delete);
export const useActivateForceUpdate = () =>
  useMutate(dataAPIForceUpdate.mutation(useQueryClient()).setActive);
