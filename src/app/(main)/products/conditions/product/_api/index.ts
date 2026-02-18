import { useApiQuery } from "@/lib/query/use-query";
import { dataAPIProductCondition } from "./data";
import { useMutate } from "@/lib/query";
import { useQueryClient } from "@tanstack/react-query";
import {
  ProductConditionDetailRequest,
  ProductConditionListRequest,
} from "./types";

// query
export const useGetProductConditionList = ({
  page,
  per_page,
  search,
  sort_by,
  order,
}: ProductConditionListRequest) =>
  useApiQuery(
    dataAPIProductCondition.query({
      page,
      per_page,
      search,
      sort_by,
      order,
    }).list,
  );
export const useGetProductConditionDetail = ({
  id,
}: ProductConditionDetailRequest) =>
  useApiQuery(dataAPIProductCondition.query({ id }).show);
export const useGetProductConditionSelect = () =>
  useApiQuery(dataAPIProductCondition.query({}).select);

// mutation
export const useCreateProductCondition = () =>
  useMutate(dataAPIProductCondition.mutation(useQueryClient()).create);
export const useUpdateProductCondition = () =>
  useMutate(dataAPIProductCondition.mutation(useQueryClient()).update);
export const useDeleteProductCondition = () =>
  useMutate(dataAPIProductCondition.mutation(useQueryClient()).delete);
export const useChangeStatusProductCondition = () =>
  useMutate(dataAPIProductCondition.mutation(useQueryClient()).changeStatus);
export const useReorderProductCondition = () =>
  useMutate(dataAPIProductCondition.mutation(useQueryClient()).reorder);
