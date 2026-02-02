import { useApiQuery } from "@/lib/query/use-query";
import { dataAPIWholesalerMarketing } from "./data";
import { useMutate } from "@/lib/query";
import { useQueryClient } from "@tanstack/react-query";

// query
export const useGetWholesalerConfigDetail = () =>
  useApiQuery(dataAPIWholesalerMarketing.query().config);

// mutation
export const useUpdateWholesalerConfig = () =>
  useMutate(dataAPIWholesalerMarketing.mutation(useQueryClient()).update);
