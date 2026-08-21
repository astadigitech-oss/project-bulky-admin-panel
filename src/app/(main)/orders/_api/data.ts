import { invalidateQuery } from "@/lib/query";
import { UseMutateConfig } from "@/lib/query/types";
import { UseApiQueryProps } from "@/lib/query/use-query";
import { keepPreviousData, QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  CancelOrderBody,
  CancelOrderParams,
  CancelOrderResponse,
  DeleteOrderParams,
  DeleteOrderResponse,
  OrderCountPaidNotProcessedResponse,
  OrderDelivereeDetailRequest,
  OrderDelivereeDetailResponse,
  OrderDetailRequest,
  OrderDetailResponse,
  OrderInvoiceRequest,
  OrderInvoiceResponse,
  OrderListRequest,
  OrderListResponse,
  OrderStatisticsRequest,
  OrderStatisticsResponse,
  OrderTrackingRequest,
  RetryBookingParams,
  RetryBookingResponse,
  TrackingResponse,
  UpdateOrderStatusBody,
  UpdateOrderStatusParams,
  UpdateOrderStatusResponse,
} from "./types";

// query-key
const key = [
  "order-list",
  "order-detail",
  "order-statistics",
  "order-tracking",
  "order-count-paid-not-processed",
];

export const dataAPIOrder = {
  query: ({
    id,
    page,
    per_page,
    sort_by,
    order,
    order_status,
    payment_type,
    delivery_type,
    buyer,
    cari,
    sort_order,
    tahun,
    bulan,
    minggu,
    tanggal_dari,
    tanggal_sampai,
  }: OrderListRequest & OrderDetailRequest & OrderStatisticsRequest): {
    list: UseApiQueryProps<OrderListResponse>;
    show: UseApiQueryProps<OrderDetailResponse>;
    statistics: UseApiQueryProps<OrderStatisticsResponse>;
    countPaidNotProcessed: UseApiQueryProps<OrderCountPaidNotProcessedResponse>;
  } => ({
    list: {
      key: [
        key[0],
        {
          page,
          per_page,
          sort_by,
          order,
          order_status,
          payment_type,
          delivery_type,
          buyer,
          cari,
          sort_order,
          tanggal_dari,
          tanggal_sampai,
        },
      ],
      endpoint: `/pesanan`,
      searchParams: {
        page: page ?? 1,
        per_page: per_page ?? 10,
        sort_by,
        order,
        order_status,
        payment_type,
        delivery_type,
        buyer: buyer || undefined,
        cari: cari || undefined,
        sort_order,
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
    countPaidNotProcessed: {
      key: [key[4]],
      endpoint: `/pesanan/count-paid-not-processed`,
      staleTime: 0,
      refetchOnWindowFocus: false,
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
    retryBooking: UseMutateConfig<
      RetryBookingResponse,
      undefined,
      RetryBookingParams
    >;
    delete: UseMutateConfig<DeleteOrderResponse, undefined, DeleteOrderParams>;
    cancel: UseMutateConfig<CancelOrderResponse, CancelOrderBody, CancelOrderParams>;
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
    retryBooking: {
      endpoint: "/pesanan/:id/retry-booking",
      method: "post",
      onSuccess: async ({ data }) => {
        toast.success(data.message);
        if (queryClient)
          await invalidateQuery(
            queryClient,
            key.map((k) => [k]),
          );
      },
      onError: { title: "RETRY_BOOKING_ORDER" },
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
    cancel: {
      endpoint: "/pesanan/:id/cancel",
      method: "post",
      onSuccess: async ({ data }) => {
        toast.success(data.message);
        if (queryClient)
          await invalidateQuery(
            queryClient,
            key.map((k) => [k]),
          );
      },
      onError: { title: "CANCEL_ORDER" },
    },
  }),
};

export const dataAPIOrderInvoice = ({
  id,
  enabled,
}: OrderInvoiceRequest & { enabled?: boolean }): UseApiQueryProps<OrderInvoiceResponse> => ({
  key: ["order-invoice", id],
  endpoint: `/pesanan/${id}/invoice`,
  enabled: !!id && enabled,
  staleTime: 0,
  refetchOnWindowFocus: false,
});

// statistik query terpisah karena param berbeda
export const dataAPIOrderStatistics = (
  params: OrderStatisticsRequest,
): UseApiQueryProps<OrderStatisticsResponse> => ({
  key: [key[2], params],
  endpoint: `/pesanan/statistics`,
  searchParams: params,
  placeholderData: keepPreviousData,
});

export const dataAPIOrderTracking = ({
  id,
  enabled,
}: OrderTrackingRequest & { enabled?: boolean }): UseApiQueryProps<TrackingResponse> => ({
  key: [key[3], id],
  endpoint: `/pesanan/${id}/tracking`,
  enabled: !!id && enabled,
  staleTime: 0,
  refetchOnWindowFocus: false,
});

export const dataAPIOrderDelivereeDetail = ({
  id,
  enabled,
}: OrderDelivereeDetailRequest & { enabled?: boolean }): UseApiQueryProps<OrderDelivereeDetailResponse> => ({
  key: ["order-deliveree-detail", id],
  endpoint: `/pesanan/${id}/deliveree-detail`,
  enabled: !!id && enabled,
  staleTime: 0,
  refetchOnWindowFocus: false,
});
