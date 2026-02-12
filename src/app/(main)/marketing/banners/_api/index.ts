import { useApiQuery } from "@/lib/query/use-query";
import { dataAPIPromo } from "./data";
import { useMutate } from "@/lib/query";
import { useQueryClient } from "@tanstack/react-query";
import { PromoDetailRequest, PromoListRequest } from "./types";

// query
export const useGetPromoList = ({
  page,
  per_page,
  search,
  sort_by,
  order,
}: PromoListRequest) =>
  useApiQuery(
    dataAPIPromo.query({
      page,
      per_page,
      search,
      sort_by,
      order,
    }).list,
  );
export const useGetPromoDetail = ({ id }: PromoDetailRequest) =>
  useApiQuery(dataAPIPromo.query({ id }).show);

// mutation
export const useCreatePromo = () =>
  useMutate(dataAPIPromo.mutation(useQueryClient()).create);
export const useUpdatePromo = () =>
  useMutate(dataAPIPromo.mutation(useQueryClient()).update);
export const useDeletePromo = () =>
  useMutate(dataAPIPromo.mutation(useQueryClient()).delete);
export const useChangeStatusPromo = () =>
  useMutate(dataAPIPromo.mutation(useQueryClient()).changeStatus);
export const useReorderPromo = () =>
  useMutate(dataAPIPromo.mutation(useQueryClient()).reorder);
