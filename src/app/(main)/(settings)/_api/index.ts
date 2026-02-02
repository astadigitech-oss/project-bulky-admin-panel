import { useApiQuery } from "@/lib/query/use-query";
import { dataAPIBuyHelp } from "./data";
import { useMutate } from "@/lib/query";
import { useQueryClient } from "@tanstack/react-query";

// query
export const useGetBuyHelpDetail = () =>
  useApiQuery(dataAPIBuyHelp.query().show);

// mutation
export const useUpdateBuyHelp = () =>
  useMutate(dataAPIBuyHelp.mutation(useQueryClient()).update);
