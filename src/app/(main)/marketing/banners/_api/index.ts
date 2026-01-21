import { useApiQuery } from "@/lib/query/use-query";
import { dataAPIPromo, PromoListRequest, PromoDetailRequest } from "./data";
import { useMutate } from "@/lib/query";
import { useQueryClient } from "@tanstack/react-query";

// query
export const useGetPromoList = ({
  page,
  per_page,
  search,
  sort_by,
  order,
}: PromoDetailRequest) =>
  useApiQuery(
    dataAPIPromo.query({
      page,
      per_page,
      search,
      sort_by,
      order,
    }).list,
  );
export const useGetPromoDetail = ({ id }: PromoListRequest) =>
  useApiQuery(dataAPIPromo.query({ id }).show);

// mutation
export const useDeletePromo = () =>
  useMutate(dataAPIPromo.mutation(useQueryClient()).delete);
