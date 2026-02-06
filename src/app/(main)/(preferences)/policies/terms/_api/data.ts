import { invalidateQuery } from "@/lib/query";
import { UseMutateConfig } from "@/lib/query/types";
import { UseApiQueryProps } from "@/lib/query/use-query";
import { keepPreviousData, QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  TermPoliciesDetailResponse,
  UpdateTermPoliciesBody,
  UpdateTermPoliciesResponse,
} from "./types";

// query-key
const key = ["term-policies-detail"];

// data
export const dataAPITermPolicies = {
  query: (): { show: UseApiQueryProps<TermPoliciesDetailResponse> } => ({
    show: {
      key: [key[0]],
      endpoint: `/dokumen-kebijakan/syarat-ketentuan`,
      placeholderData: keepPreviousData,
    },
  }),
  mutation: (
    queryClient?: QueryClient,
  ): {
    update: UseMutateConfig<UpdateTermPoliciesResponse, UpdateTermPoliciesBody>;
  } => ({
    update: {
      endpoint: "/dokumen-kebijakan/syarat-ketentuan",
      method: "put",
      onSuccess: async ({ data }) => {
        toast.success(data.message);
        if (queryClient) await invalidateQuery(queryClient, [[key[0]]]);
      },
      onError: { title: "UPDATE_TERMS_CONDITIONS" },
    },
  }),
};
