import { useApiQuery } from "@/lib/query/use-query";
import { dataAPIPackageCondition } from "./data";
import { useMutate } from "@/lib/query";
import { useQueryClient } from "@tanstack/react-query";
import {
  PackageConditionDetailRequest,
  PackageConditionListRequest,
} from "./types";

// query
export const useGetPackageConditionList = ({
  page,
  per_page,
  search,
  sort_by,
  order,
}: PackageConditionListRequest) =>
  useApiQuery(
    dataAPIPackageCondition.query({
      page,
      per_page,
      search,
      sort_by,
      order,
    }).list,
  );
export const useGetPackageConditionDetail = ({
  id,
}: PackageConditionDetailRequest) =>
  useApiQuery(dataAPIPackageCondition.query({ id }).show);

// mutation
export const useCreatePackageCondition = () =>
  useMutate(dataAPIPackageCondition.mutation(useQueryClient()).create);
export const useUpdatePackageCondition = () =>
  useMutate(dataAPIPackageCondition.mutation(useQueryClient()).update);
export const useDeletePackageCondition = () =>
  useMutate(dataAPIPackageCondition.mutation(useQueryClient()).delete);
export const useChangeStatusPackageCondition = () =>
  useMutate(dataAPIPackageCondition.mutation(useQueryClient()).changeStatus);
export const useReorderPackageCondition = () =>
  useMutate(dataAPIPackageCondition.mutation(useQueryClient()).reorder);
