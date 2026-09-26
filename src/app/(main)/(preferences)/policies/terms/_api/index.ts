import { useApiQuery } from "@/lib/query/use-query";
import { dataAPITermPolicies } from "./data";
import { useMutate } from "@/lib/query";
import { useQueryClient } from "@tanstack/react-query";

// query
export const useGetTermPoliciesDetail = (slug = "syarat-ketentuan") =>
  useApiQuery(dataAPITermPolicies.query(slug).show);

// mutation
export const useUpdateTermPolicies = (slug = "syarat-ketentuan") =>
  useMutate(dataAPITermPolicies.mutation(slug, useQueryClient()).update);
