import axios from "axios";
import { getCookie } from "cookies-next/client";
import { useApiQuery } from "@/lib/query/use-query";
import {
  BuyerListRequest,
  BuyerDetailRequest,
  BuyerChartRequest,
} from "./types";
import { useMutate } from "@/lib/query";
import { useQueryClient } from "@tanstack/react-query";
import { dataAPIBuyer } from "./data";
import { apiUrl, cookiesKey } from "@/config";

export const exportBuyerList = async (params: {
  search?: string;
  sort_by?: string;
  order?: "asc" | "desc";
}) => {
  const query = new URLSearchParams();
  if (params.search) query.set("search", params.search);
  if (params.sort_by) query.set("sort_by", params.sort_by);
  if (params.order) query.set("order", params.order);
  const token = getCookie(cookiesKey);
  const response = await axios.get(
    apiUrl + "/buyer/export" + (query.toString() ? "?" + query.toString() : ""),
    { headers: { Authorization: "Bearer " + token }, responseType: "blob" },
  );
  return response.data as Blob;
};

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
