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
const endpointForSlug = (slug: string) =>
  slug === "syarat-ketentuan-lelang"
    ? "/dokumen-kebijakan-lelang"
    : `/dokumen-kebijakan/${slug}`;

// data
export const dataAPITermPolicies = {
  query: (slug = "syarat-ketentuan"): { show: UseApiQueryProps<TermPoliciesDetailResponse> } => ({
    show: {
      key: [key[0], slug],
      endpoint: endpointForSlug(slug),
      placeholderData: keepPreviousData,
    },
  }),
  mutation: (
    slug = "syarat-ketentuan",
    queryClient?: QueryClient,
  ): {
    update: UseMutateConfig<UpdateTermPoliciesResponse, UpdateTermPoliciesBody>;
  } => ({
    update: {
      endpoint: endpointForSlug(slug),
      method: "put",
      onSuccess: async ({ data }) => {
        toast.success(data.message);
        if (queryClient) await invalidateQuery(queryClient, [[key[0], slug]]);
      },
      onError: { title: "UPDATE_TERMS_CONDITIONS" },
    },
  }),
};
