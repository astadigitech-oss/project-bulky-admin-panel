import { invalidateQuery } from "@/lib/query";
import { UseMutateConfig } from "@/lib/query/types";
import { UseApiQueryProps } from "@/lib/query/use-query";

import { keepPreviousData, QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  BuyerChartRequest,
  BuyerChartResponse,
  BuyerDetailRequest,
  BuyerDetailResponse,
  BuyerListRequest,
  BuyerListResponse,
  BuyerStatResponse,
  DeleteBuyerParams,
  DeleteBuyerResponse,
  ResetPasswordBuyerBody,
  ResetPasswordBuyerParams,
  ResetPasswordBuyerResponse,
} from "./types";

// query-key
const key = ["buyer-list", "buyer-chart", "buyer-stat"];

// data
export const dataAPIBuyer = {
  query: ({
    id,
    page,
    per_page,
    search,
    sort_by,
    order,
    filter,
    tahun,
    bulan,
    minggu,
    tanggal_dari,
    tanggal_sampai,
  }: BuyerListRequest & BuyerDetailRequest & BuyerChartRequest): {
    list: UseApiQueryProps<BuyerListResponse>;
    show: UseApiQueryProps<BuyerDetailResponse>;
    chart: UseApiQueryProps<BuyerChartResponse>;
    stats: UseApiQueryProps<BuyerStatResponse>;
  } => ({
    list: {
      key: [key[0], { page, per_page, search, sort_by, order }],
      endpoint: `/buyer`,
      searchParams: { page, per_page, search, sort_by, order },
      placeholderData: keepPreviousData,
    },
    show: {
      key: ["staff-detail", id],
      endpoint: `/buyer/${id}`,
      enabled: !!id,
    },
    chart: {
      key: [
        key[1],
        { filter, tahun, bulan, minggu, tanggal_dari, tanggal_sampai },
      ],
      endpoint: `/buyer/chart`,
      searchParams: {
        filter,
        tahun,
        bulan,
        minggu,
        tanggal_dari,
        tanggal_sampai,
      },
      placeholderData: keepPreviousData,
    },
    stats: {
      key: [key[2]],
      endpoint: `/buyer/statistik`,
      placeholderData: keepPreviousData,
    },
  }),
  mutation: (
    queryClient?: QueryClient,
  ): {
    delete: UseMutateConfig<DeleteBuyerResponse, undefined, DeleteBuyerParams>;
    resetPassword: UseMutateConfig<
      ResetPasswordBuyerResponse,
      ResetPasswordBuyerBody,
      ResetPasswordBuyerParams
    >;
  } => ({
    delete: {
      endpoint: "/buyer/:id",
      method: "delete",
      onSuccess: async ({ data }) => {
        toast.success(data.message);
        if (queryClient)
          await invalidateQuery(
            queryClient,
            key.map((k) => [k]),
          );
      },
      onError: { title: "DELETE_BUYER" },
    },
    resetPassword: {
      endpoint: "/buyer/:id/reset-password",
      method: "put",
      onSuccess: async ({ data }) => {
        toast.success(data.message);
      },
      onError: { title: "RESET_PASSWORD_BUYER" },
    },
  }),
};
