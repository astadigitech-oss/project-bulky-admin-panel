import { invalidateQuery } from "@/lib/query";
import { UseMutateConfig } from "@/lib/query/types";
import { UseApiQueryProps } from "@/lib/query/use-query";
import { keepPreviousData, QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  PrivacyPoliciesDetailResponse,
  UpdatePrivacyPoliciesBody,
  UpdatePrivacyPoliciesResponse,
} from "./types";

// query-key
const key = ["privacy-policies-detail"];

// data
export const dataAPIPrivacyPolicies = {
  query: (): { show: UseApiQueryProps<PrivacyPoliciesDetailResponse> } => ({
    show: {
      key: [key[0]],
      endpoint: `/dokumen-kebijakan/kebijakan-privasi`,
      placeholderData: keepPreviousData,
    },
  }),
  mutation: (
    queryClient?: QueryClient,
  ): {
    update: UseMutateConfig<
      UpdatePrivacyPoliciesResponse,
      UpdatePrivacyPoliciesBody
    >;
  } => ({
    update: {
      endpoint: "/dokumen-kebijakan/kebijakan-privasi",
      method: "put",
      onSuccess: async ({ data }) => {
        toast.success(data.message);
        if (queryClient) await invalidateQuery(queryClient, [[key[0]]]);
      },
      onError: { title: "UPDATE_PRIVACY_POLICIES" },
    },
  }),
};
