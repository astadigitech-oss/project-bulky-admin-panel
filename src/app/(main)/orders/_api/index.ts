import { useApiQuery } from "@/lib/query/use-query";
import { useMutate } from "@/lib/query";
import { useQueryClient } from "@tanstack/react-query";
import { dataAPIOrder } from "./data";
import {
  OrderDetailRequest,
  OrderListRequest,
  OrderStatisticsRequest,
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

// ─── Mutation ────────────────────────────────────────────────────────────────

export const useUpdateOrderStatus = () =>
  useMutate(dataAPIOrder.mutation(useQueryClient()).updateStatus);

export const useDeleteOrder = () =>
  useMutate(dataAPIOrder.mutation(useQueryClient()).delete);
