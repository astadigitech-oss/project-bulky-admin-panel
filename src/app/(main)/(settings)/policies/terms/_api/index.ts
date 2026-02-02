import { useApiQuery } from "@/lib/query/use-query";
import { dataAPITermPolicies } from "./data";
import { useMutate } from "@/lib/query";
import { useQueryClient } from "@tanstack/react-query";

// query
export const useGetTermPoliciesDetail = () =>
  useApiQuery(dataAPITermPolicies.query().show);

// mutation
export const useUpdateTermPolicies = () =>
  useMutate(dataAPITermPolicies.mutation(useQueryClient()).update);
