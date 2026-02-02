import { invalidateQuery } from "@/lib/query";
import { UseMutateConfig } from "@/lib/query/types";
import { UseApiQueryProps } from "@/lib/query/use-query";
import { keepPreviousData, QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  PaymentHelpDetailResponse,
  UpdatePaymentHelpBody,
  UpdatePaymentHelpResponse,
} from "./types";

// query-key
const key = ["payment-help-detail"];

// data
export const dataAPIPaymentHelp = {
  query: (): { show: UseApiQueryProps<PaymentHelpDetailResponse> } => ({
    show: {
      key: [key[0]],
      endpoint: `/dokumen-kebijakan/tentang-pembayaran`,
      placeholderData: keepPreviousData,
    },
  }),
  mutation: (
    queryClient?: QueryClient,
  ): {
    update: UseMutateConfig<UpdatePaymentHelpResponse, UpdatePaymentHelpBody>;
  } => ({
    update: {
      endpoint: "/dokumen-kebijakan/tentang-pembayaran",
      method: "put",
      onSuccess: async ({ data }) => {
        toast.success(data.message);
        if (queryClient) await invalidateQuery(queryClient, [[key[0]]]);
      },
      onError: { title: "UPDATE_PAYMENT_GUIDE" },
    },
  }),
};
