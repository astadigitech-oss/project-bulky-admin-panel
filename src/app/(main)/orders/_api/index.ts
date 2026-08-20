import { useApiQuery } from "@/lib/query/use-query";
import { useMutate } from "@/lib/query";
import { useQueryClient } from "@tanstack/react-query";
import { dataAPIOrder, dataAPIOrderDelivereeDetail, dataAPIOrderInvoice, dataAPIOrderTracking } from "./data";
import {
  OrderDelivereeDetailRequest,
  OrderDetailRequest,
  OrderInvoiceRequest,
  OrderListRequest,
  OrderStatisticsRequest,
  OrderTrackingRequest,
} from "./types";

// ─── Query ───────────────────────────────────────────────────────────────────

export const useGetOrderList = (
  params: OrderListRequest & { enabled?: boolean },
) => {
  const { enabled, ...rest } = params;
  return useApiQuery({ ...dataAPIOrder.query(rest).list, enabled });
};

export const useGetOrderDetail = ({ id }: OrderDetailRequest) =>
  useApiQuery(dataAPIOrder.query({ id }).show);

export const useGetOrderStatistics = (params: OrderStatisticsRequest) =>
  useApiQuery(dataAPIOrder.query(params as any).statistics);

export const useGetOrderCountPaidNotProcessed = ({
  enabled,
}: { enabled?: boolean } = {}) =>
  useApiQuery({
    ...dataAPIOrder.query({}).countPaidNotProcessed,
    enabled,
  });

export const useGetOrderTracking = (
  params: OrderTrackingRequest & { enabled?: boolean },
) => useApiQuery(dataAPIOrderTracking(params));

export const useGetOrderInvoice = (
  params: OrderInvoiceRequest & { enabled?: boolean },
) => useApiQuery(dataAPIOrderInvoice(params));

export const useGetOrderDelivereeDetail = (
  params: OrderDelivereeDetailRequest & { enabled?: boolean },
) => useApiQuery(dataAPIOrderDelivereeDetail(params));

// ─── Mutation ────────────────────────────────────────────────────────────────

export const useUpdateOrderStatus = () =>
  useMutate(dataAPIOrder.mutation(useQueryClient()).updateStatus);

export const useRetryBooking = () =>
  useMutate(dataAPIOrder.mutation(useQueryClient()).retryBooking);

export const useDeleteOrder = () =>
  useMutate(dataAPIOrder.mutation(useQueryClient()).delete);

export const useCancelOrder = () =>
  useMutate(dataAPIOrder.mutation(useQueryClient()).cancel);
