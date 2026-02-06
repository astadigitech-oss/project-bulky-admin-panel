import { invalidateQuery } from "@/lib/query";
import { UseMutateConfig } from "@/lib/query/types";
import { UseApiQueryProps } from "@/lib/query/use-query";
import { keepPreviousData, QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  DisclaimerDetailRequest,
  DisclaimerDetailResponse,
  DisclaimerListRequest,
  DisclaimerListResponse,
  ChangeStatusDisclaimerParams,
  ChangeStatusDisclaimerResponse,
  CreateDisclaimerBody,
  CreateDisclaimerResponse,
  DeleteDisclaimerParams,
  DeleteDisclaimerResponse,
  UpdateDisclaimerBody,
  UpdateDisclaimerParams,
  UpdateDisclaimerResponse,
} from "./types";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

// query-key
const key = ["disclaimer-list", "disclaimer-detail"];

// data
export const dataAPIDisclaimer = {
  query: ({
    id,
    page,
    per_page,
    search,
    sort_by,
    order,
  }: DisclaimerListRequest & DisclaimerDetailRequest): {
    list: UseApiQueryProps<DisclaimerListResponse>;
    show: UseApiQueryProps<DisclaimerDetailResponse>;
  } => ({
    list: {
      key: [key[0], { page, per_page, search, sort_by, order }],
      endpoint: `/disclaimer`,
      searchParams: { page, per_page, search, sort_by, order },
      placeholderData: keepPreviousData,
    },
    show: {
      key: [key[1], id],
      endpoint: `/disclaimer/${id}`,
      enabled: !!id,
    },
  }),
  mutation: (
    queryClient?: QueryClient,
    router?: AppRouterInstance,
  ): {
    create: UseMutateConfig<CreateDisclaimerResponse, CreateDisclaimerBody>;
    update: UseMutateConfig<
      UpdateDisclaimerResponse,
      UpdateDisclaimerBody,
      UpdateDisclaimerParams
    >;
    delete: UseMutateConfig<
      DeleteDisclaimerResponse,
      undefined,
      DeleteDisclaimerParams
    >;
    changeStatus: UseMutateConfig<
      ChangeStatusDisclaimerResponse,
      undefined,
      ChangeStatusDisclaimerParams
    >;
  } => ({
    create: {
      endpoint: "/disclaimer",
      method: "post",
      onSuccess: async ({ data }) => {
        toast.success(data.message);
        if (queryClient)
          await invalidateQuery(queryClient, [
            [key[0]],
            [key[1], data.data.id],
          ]);

        router?.push("/policies/disclaimer");
      },
      onError: { title: "CREATE_DISCLAIMER" },
    },
    update: {
      endpoint: "/disclaimer/:id",
      method: "put",
      onSuccess: async ({ data }) => {
        toast.success(data.message);
        if (queryClient)
          await invalidateQuery(queryClient, [
            [key[0]],
            [key[1], data.data.id],
          ]);
        router?.push("/policies/disclaimer");
      },
      onError: { title: "UPDATE_DISCLAIMER" },
    },
    delete: {
      endpoint: "/disclaimer/:id",
      method: "delete",
      onSuccess: async ({ data }) => {
        toast.success(data.message);
        if (queryClient) await invalidateQuery(queryClient, [[key[0]]]);
      },
      onError: { title: "DELETE_DISCLAIMER" },
    },
    changeStatus: {
      endpoint: "/disclaimer/:id/set-active",
      method: "patch",
      onSuccess: async ({ data }) => {
        toast.success(data.message);
        if (queryClient)
          await invalidateQuery(queryClient, [
            [key[0]],
            [key[1], data.data.id],
          ]);
      },
      onError: { title: "CHANGE_STATUS_DISCLAIMER" },
    },
  }),
};
