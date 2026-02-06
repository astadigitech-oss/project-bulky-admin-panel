import { useApiQuery } from "@/lib/query/use-query";
import { dataAPIPaymentHelp } from "./data";
import { useMutate } from "@/lib/query";
import { useQueryClient } from "@tanstack/react-query";

// query
export const useGetPaymentHelpDetail = () =>
  useApiQuery(dataAPIPaymentHelp.query().show);

// mutation
export const useUpdatePaymentHelp = () =>
  useMutate(dataAPIPaymentHelp.mutation(useQueryClient()).update);
