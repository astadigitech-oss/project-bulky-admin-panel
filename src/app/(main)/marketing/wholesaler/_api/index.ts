import { useApiQuery } from "@/lib/query/use-query";
import { dataAPIWholesalerMarketing } from "./data";
import { useMutate } from "@/lib/query";
import { useQueryClient } from "@tanstack/react-query";

// query
export const useGetWholesalerConfigDetail = () =>
  useApiQuery(dataAPIWholesalerMarketing.query().config);

export const useGetWholesalerAnggaranList = () =>
  useApiQuery(dataAPIWholesalerMarketing.query().listAnggaran);

// mutation
export const useUpdateWholesalerConfig = () =>
  useMutate(dataAPIWholesalerMarketing.mutation(useQueryClient()).updateConfig);

export const useCreateWholesalerAnggaran = () =>
  useMutate(
    dataAPIWholesalerMarketing.mutation(useQueryClient()).createAnggaran,
  );

export const useUpdateWholesalerAnggaran = () =>
  useMutate(
    dataAPIWholesalerMarketing.mutation(useQueryClient()).updateAnggaran,
  );

export const useReorderWholesalerAnggaran = () =>
  useMutate(
    dataAPIWholesalerMarketing.mutation(useQueryClient()).reorderAnggaran,
  );

export const useDeleteWholesalerAnggaran = () =>
  useMutate(
    dataAPIWholesalerMarketing.mutation(useQueryClient()).deleteAnggaran,
  );
