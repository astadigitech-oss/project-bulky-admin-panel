import { invalidateQuery } from "@/lib/query";
import { UseMutateConfig } from "@/lib/query/types";
import { UseApiQueryProps } from "@/lib/query/use-query";
import { keepPreviousData, QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ApproveReviewParams,
  ApproveReviewResponse,
  BulkApproveReviewBody,
  BulkApproveReviewResponse,
  DeleteReviewParams,
  DeleteReviewResponse,
  RejectReviewParams,
  RejectReviewResponse,
  ReviewDetailRequest,
  ReviewDetailResponse,
  ReviewListRequest,
  ReviewListResponse,
} from "./types";

const key = ["review-list", "review-detail"];

export const dataAPIReview = {
  query: ({
    id,
    page,
    per_page,
    cari,
    rating,
    is_approved,
    sort_by,
    sort_order,
  }: ReviewListRequest & ReviewDetailRequest): {
    list: UseApiQueryProps<ReviewListResponse>;
    show: UseApiQueryProps<ReviewDetailResponse>;
  } => ({
    list: {
      key: [
        key[0],
        { page, per_page, cari, rating, is_approved, sort_by, sort_order },
      ],
      endpoint: `/ulasan`,
      searchParams: {
        page: page ?? 1,
        per_page: per_page ?? 10,
        cari: cari || undefined,
        rating,
        is_approved,
        sort_by,
        sort_order,
      },
      placeholderData: keepPreviousData,
    },
    show: {
      key: [key[1], id],
      endpoint: `/ulasan/${id}`,
      enabled: !!id,
    },
  }),

  mutation: (
    queryClient?: QueryClient,
  ): {
    approve: UseMutateConfig<ApproveReviewResponse, undefined, ApproveReviewParams>;
    reject: UseMutateConfig<RejectReviewResponse, undefined, RejectReviewParams>;
    bulkApprove: UseMutateConfig<BulkApproveReviewResponse, BulkApproveReviewBody, undefined>;
    delete: UseMutateConfig<DeleteReviewResponse, undefined, DeleteReviewParams>;
  } => ({
    approve: {
      endpoint: "/ulasan/:id/approve",
      method: "patch",
      onSuccess: async ({ data }) => {
        toast.success(data.message);
        if (queryClient)
          await invalidateQuery(queryClient, key.map((k) => [k]));
      },
      onError: { title: "APPROVE_REVIEW" },
    },
    reject: {
      endpoint: "/ulasan/:id/reject",
      method: "patch",
      onSuccess: async ({ data }) => {
        toast.success(data.message);
        if (queryClient)
          await invalidateQuery(queryClient, key.map((k) => [k]));
      },
      onError: { title: "REJECT_REVIEW" },
    },
    bulkApprove: {
      endpoint: "/ulasan/bulk-approve",
      method: "patch",
      onSuccess: async ({ data }) => {
        toast.success(data.message);
        if (queryClient)
          await invalidateQuery(queryClient, key.map((k) => [k]));
      },
      onError: { title: "BULK_APPROVE_REVIEW" },
    },
    delete: {
      endpoint: "/ulasan/:id",
      method: "delete",
      onSuccess: async ({ data }) => {
        toast.success(data.message);
        if (queryClient)
          await invalidateQuery(queryClient, key.map((k) => [k]));
      },
      onError: { title: "DELETE_REVIEW" },
    },
  }),
};
