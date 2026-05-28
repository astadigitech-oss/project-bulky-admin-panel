import { invalidateQuery } from "@/lib/query";
import { UseMutateConfig } from "@/lib/query/types";
import { UseApiQueryProps } from "@/lib/query/use-query";
import { keepPreviousData, QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  DeleteOrderParams,
  DeleteOrderResponse,
  OrderDetailRequest,
  OrderDetailResponse,
  OrderListRequest,
  OrderListResponse,
  OrderStatisticsRequest,
  OrderStatisticsResponse,
  UpdateOrderStatusBody,
  UpdateOrderStatusParams,
  UpdateOrderStatusResponse,
} from "./types";

// query-key
const key = ["order-list", "order-detail", "order-statistics"];

export const dataAPIOrder = {
  query: ({
    id,
    page,
    per_page,
    search,
    sort_by,
    order,
    status,
    payment_status,
    delivery_type,
    tahun,
    bulan,
    minggu,
    tanggal_dari,
    tanggal_sampai,
  }: OrderListRequest & OrderDetailRequest & OrderStatisticsRequest): {
    list: UseApiQueryProps<OrderListResponse>;
    show: UseApiQueryProps<OrderDetailResponse>;
    statistics: UseApiQueryProps<OrderStatisticsResponse>;
  } => ({
    list: {
      key: [
        key[0],
        {
          page,
          per_page,
          search,
          sort_by,
          order,
          status,
          payment_status,
          delivery_type,
          tanggal_dari,
          tanggal_sampai,
        },
      ],
      endpoint: `/pesanan`,
      searchParams: {
        page: page ?? 1,
        per_page: per_page ?? 10,
        search: search || undefined,
        sort_by,
        order,
        status,
        payment_status,
        delivery_type,
        tanggal_dari,
        tanggal_sampai,
      },
      placeholderData: keepPreviousData,
    },
    show: {
      key: [key[1], id],
      endpoint: `/pesanan/${id}`,
      enabled: !!id,
    },
    statistics: {
      key: [key[2], { tahun, bulan, minggu, tanggal_dari, tanggal_sampai }],
      endpoint: `/pesanan/statistics`,
      searchParams: { tahun, bulan, minggu, tanggal_dari, tanggal_sampai },
      placeholderData: keepPreviousData,
    },
  }),

  mutation: (
    queryClient?: QueryClient,
  ): {
    updateStatus: UseMutateConfig<
      UpdateOrderStatusResponse,
      UpdateOrderStatusBody,
      UpdateOrderStatusParams
    >;
    delete: UseMutateConfig<DeleteOrderResponse, undefined, DeleteOrderParams>;
  } => ({
    updateStatus: {
      endpoint: "/pesanan/:id/update-status",
      method: "patch",
      onSuccess: async ({ data }) => {
        toast.success(data.message);
        if (queryClient)
          await invalidateQuery(
            queryClient,
            key.map((k) => [k]),
          );
      },
      onError: { title: "UPDATE_STATUS_ORDER" },
    },
    delete: {
      endpoint: "/pesanan/:id",
      method: "delete",
      onSuccess: async ({ data }) => {
        toast.success(data.message);
        if (queryClient)
          await invalidateQuery(
            queryClient,
            key.map((k) => [k]),
          );
      },
      onError: { title: "DELETE_ORDER" },
    },
  }),
};

// statistik query terpisah karena param berbeda
export const dataAPIOrderStatistics = (
  params: OrderStatisticsRequest,
): UseApiQueryProps<OrderStatisticsResponse> => ({
  key: [key[2], params],
  endpoint: `/pesanan/statistics`,
  searchParams: params,
  placeholderData: keepPreviousData,
});
