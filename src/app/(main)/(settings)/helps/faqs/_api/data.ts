import { invalidateQuery } from "@/lib/query";
import { UseMutateConfig } from "@/lib/query/types";
import { UseApiQueryProps } from "@/lib/query/use-query";
import { keepPreviousData, QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  FAQsDetailRequest,
  FAQsDetailResponse,
  FAQsListRequest,
  FAQsListResponse,
  ChangeStatusFAQsParams,
  ChangeStatusFAQsResponse,
  CreateFAQsBody,
  CreateFAQsResponse,
  DeleteFAQsParams,
  DeleteFAQsResponse,
  UpdateFAQsBody,
  UpdateFAQsParams,
  UpdateFAQsResponse,
  ReorderFAQsResponse,
  ReorderFAQsParams,
  ReorderFAQsBody,
} from "./types";

// query-key
const key = ["faq-product-list", "faq-product-detail"];

// data
export const dataAPIFAQs = {
  query: ({
    id,
    page,
    per_page,
    search,
    sort_by,
    order,
  }: FAQsListRequest & FAQsDetailRequest): {
    list: UseApiQueryProps<FAQsListResponse>;
    show: UseApiQueryProps<FAQsDetailResponse>;
  } => ({
    list: {
      key: [key[0], { page, per_page, search, sort_by, order }],
      endpoint: `/faq`,
      searchParams: { page, per_page, search, sort_by, order },
      placeholderData: keepPreviousData,
    },
    show: {
      key: [key[1], id],
      endpoint: `/faq/${id}`,
      enabled: !!id,
    },
  }),
  mutation: (
    queryClient?: QueryClient,
  ): {
    create: UseMutateConfig<CreateFAQsResponse, CreateFAQsBody>;
    update: UseMutateConfig<
      UpdateFAQsResponse,
      UpdateFAQsBody,
      UpdateFAQsParams
    >;
    delete: UseMutateConfig<DeleteFAQsResponse, undefined, DeleteFAQsParams>;
    changeStatus: UseMutateConfig<
      ChangeStatusFAQsResponse,
      undefined,
      ChangeStatusFAQsParams
    >;
    reorder: UseMutateConfig<
      ReorderFAQsResponse,
      ReorderFAQsBody,
      ReorderFAQsParams
    >;
  } => ({
    create: {
      endpoint: "/faq",
      method: "post",
      onSuccess: async ({ data }) => {
        toast.success(data.message);
        if (queryClient)
          await invalidateQuery(queryClient, [
            [key[0]],
            [key[1], data.data.id],
          ]);
      },
      onError: { title: "CREATE_FAQS" },
    },
    update: {
      endpoint: "/faq/:id",
      method: "put",
      onSuccess: async ({ data }) => {
        toast.success(data.message);
        if (queryClient)
          await invalidateQuery(queryClient, [
            [key[0]],
            [key[1], data.data.id],
          ]);
      },
      onError: { title: "UPDATE_FAQS" },
    },
    delete: {
      endpoint: "/faq/:id",
      method: "delete",
      onSuccess: async ({ data }) => {
        toast.success(data.message);
        if (queryClient) await invalidateQuery(queryClient, [[key[0]]]);
      },
      onError: { title: "DELETE_FAQS" },
    },
    changeStatus: {
      endpoint: "/faq/:id/toggle-status",
      method: "patch",
      onSuccess: async ({ data }) => {
        toast.success(data.message);
        if (queryClient)
          await invalidateQuery(queryClient, [
            [key[0]],
            [key[1], data.data.id],
          ]);
      },
      onError: { title: "CHANGE_STATUS_FAQS" },
    },
    reorder: {
      endpoint: "/faq/:id/reorder",
      method: "patch",
      onSuccess: async ({ data }) => {
        toast.success(data.message);
        if (queryClient)
          await invalidateQuery(queryClient, [
            [key[0]],
            [key[1], data.data.item.id],
            [key[1], data.data.swapped_with.id],
          ]);
      },
      onError: { title: "REORDER_FAQS" },
    },
  }),
};
