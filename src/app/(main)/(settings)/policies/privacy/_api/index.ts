import { useApiQuery } from "@/lib/query/use-query";
import { dataAPIPrivacyPolicies } from "./data";
import { useMutate } from "@/lib/query";
import { useQueryClient } from "@tanstack/react-query";

// query
export const useGetPrivacyPoliciesDetail = () =>
  useApiQuery(dataAPIPrivacyPolicies.query().show);

// mutation
export const useUpdatePrivacyPolicies = () =>
  useMutate(dataAPIPrivacyPolicies.mutation(useQueryClient()).update);
