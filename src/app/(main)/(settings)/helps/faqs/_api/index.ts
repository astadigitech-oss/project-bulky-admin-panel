import { useApiQuery } from "@/lib/query/use-query";
import { dataAPIFAQs } from "./data";
import { useMutate } from "@/lib/query";
import { useQueryClient } from "@tanstack/react-query";
import { FAQsDetailRequest, FAQsListRequest } from "./types";

// query
export const useGetFAQsList = ({
  page,
  per_page,
  search,
  sort_by,
  order,
}: FAQsListRequest) =>
  useApiQuery(
    dataAPIFAQs.query({
      page,
      per_page,
      search,
      sort_by,
      order,
    }).list,
  );
export const useGetFAQsDetail = ({ id }: FAQsDetailRequest) =>
  useApiQuery(dataAPIFAQs.query({ id }).show);

// mutation
export const useCreateFAQs = () =>
  useMutate(dataAPIFAQs.mutation(useQueryClient()).create);
export const useUpdateFAQs = () =>
  useMutate(dataAPIFAQs.mutation(useQueryClient()).update);
export const useDeleteFAQs = () =>
  useMutate(dataAPIFAQs.mutation(useQueryClient()).delete);
export const useChangeStatusFAQs = () =>
  useMutate(dataAPIFAQs.mutation(useQueryClient()).changeStatus);
export const useReorderFAQs = () =>
  useMutate(dataAPIFAQs.mutation(useQueryClient()).reorder);
