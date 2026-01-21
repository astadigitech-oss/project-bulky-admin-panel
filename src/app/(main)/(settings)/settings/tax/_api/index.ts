import { useApiQuery } from "@/lib/query/use-query";
import { useMutate } from "@/lib/query";
import { useQueryClient } from "@tanstack/react-query";
import { dataAPITaxes, TaxDetailRequest, TaxListRequest } from "./data";

// query
export const useGetTaxList = ({
  page,
  per_page,
  search,
  sort_by,
  order,
}: TaxListRequest) =>
  useApiQuery(
    dataAPITaxes.query({
      page,
      per_page,
      search,
      sort_by,
      order,
    }).list,
  );

export const useGetTaxDetail = ({ id }: TaxDetailRequest) =>
  useApiQuery(
    dataAPITaxes.query({
      id,
    }).detail,
  );

// mutation
export const useCreateTax = () =>
  useMutate(dataAPITaxes.mutation(useQueryClient()).create);
export const useUpdateTax = () =>
  useMutate(dataAPITaxes.mutation(useQueryClient()).update);
export const useDeleteTax = () =>
  useMutate(dataAPITaxes.mutation(useQueryClient()).delete);
export const useChangeStatusTax = () =>
  useMutate(dataAPITaxes.mutation(useQueryClient()).changeStatus);
