import { useApiQuery } from "@/lib/query/use-query";
import {
  BuyerListRequest,
  BuyerDetailRequest,
  BuyerChartRequest,
} from "./types";
import { useMutate } from "@/lib/query";
import { useQueryClient } from "@tanstack/react-query";
import { dataAPIBuyer } from "./data";

// query
export const useGetBuyerList = ({
  page,
  per_page,
  search,
  sort_by,
  order,
}: BuyerDetailRequest) =>
  useApiQuery(
    dataAPIBuyer.query({
      page,
      per_page,
      search,
      sort_by,
      order,
    }).list,
  );
export const useGetBuyerDetail = ({ id }: BuyerListRequest) =>
  useApiQuery(dataAPIBuyer.query({ id }).show);
export const useGetBuyerChart = ({
  filter,
  tahun,
  bulan,
  minggu,
  tanggal_dari,
  tanggal_sampai,
}: BuyerChartRequest) =>
  useApiQuery(
    dataAPIBuyer.query({
      filter,
      tahun,
      bulan,
      minggu,
      tanggal_dari,
      tanggal_sampai,
    }).chart,
  );
export const useGetBuyerStat = () => useApiQuery(dataAPIBuyer.query({}).stats);

// mutation
export const useDeleteBuyer = () =>
  useMutate(dataAPIBuyer.mutation(useQueryClient()).delete);
export const useResetPasswordBuyer = () =>
  useMutate(dataAPIBuyer.mutation().resetPassword);
