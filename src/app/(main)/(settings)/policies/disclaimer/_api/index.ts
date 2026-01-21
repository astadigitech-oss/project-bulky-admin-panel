import { useApiQuery } from "@/lib/query/use-query";
import { dataAPIDisclaimer } from "./data";
import { useMutate } from "@/lib/query";
import { useQueryClient } from "@tanstack/react-query";
import { DisclaimerDetailRequest, DisclaimerListRequest } from "./types";
import { useRouter } from "next/navigation";

// query
export const useGetDisclaimerList = ({
  page,
  per_page,
  search,
  sort_by,
  order,
}: DisclaimerListRequest) =>
  useApiQuery(
    dataAPIDisclaimer.query({
      page,
      per_page,
      search,
      sort_by,
      order,
    }).list,
  );
export const useGetDisclaimerDetail = ({ id }: DisclaimerDetailRequest) =>
  useApiQuery(dataAPIDisclaimer.query({ id }).show);

// mutation
export const useCreateDisclaimer = () =>
  useMutate(dataAPIDisclaimer.mutation(useQueryClient(), useRouter()).create);
export const useUpdateDisclaimer = () =>
  useMutate(dataAPIDisclaimer.mutation(useQueryClient(), useRouter()).update);
export const useDeleteDisclaimer = () =>
  useMutate(dataAPIDisclaimer.mutation(useQueryClient()).delete);
export const useChangeStatusDisclaimer = () =>
  useMutate(dataAPIDisclaimer.mutation(useQueryClient()).changeStatus);
