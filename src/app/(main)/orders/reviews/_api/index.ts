import { useApiQuery } from "@/lib/query/use-query";
import { useMutate } from "@/lib/query";
import { useQueryClient } from "@tanstack/react-query";
import { dataAPIReview } from "./data";
import { ReviewDetailRequest, ReviewListRequest } from "./types";

// ─── Query ────────────────────────────────────────────────────────────────────

export const useGetReviewList = (
  params: ReviewListRequest & { enabled?: boolean },
) => {
  const { enabled, ...rest } = params;
  return useApiQuery({ ...dataAPIReview.query(rest).list, enabled });
};

export const useGetReviewDetail = ({ id }: ReviewDetailRequest) =>
  useApiQuery(dataAPIReview.query({ id }).show);

// ─── Mutation ─────────────────────────────────────────────────────────────────

export const useApproveReview = () =>
  useMutate(dataAPIReview.mutation(useQueryClient()).approve);

export const useRejectReview = () =>
  useMutate(dataAPIReview.mutation(useQueryClient()).reject);

export const useBulkApproveReview = () =>
  useMutate(dataAPIReview.mutation(useQueryClient()).bulkApprove);

export const useDeleteReview = () =>
  useMutate(dataAPIReview.mutation(useQueryClient()).delete);
