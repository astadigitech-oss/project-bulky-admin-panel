import { invalidateQuery } from "@/lib/query";
import { UseMutateConfig } from "@/lib/query/types";
import { keepPreviousData, QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ChangePasswordBody,
  ChangePasswordResponse,
  UpdateProfileBody,
  UpdateProfileResponse,
  UpdateWhatsAppHandlerBody,
  UpdateWhatsAppHandlerResponse,
  WhatsAppHandlerResponse,
} from "./types";
import { UseApiQueryProps } from "@/lib/query/use-query";

// data
export const dataAPIGeneral = {
  query: (): { whatsApp: UseApiQueryProps<WhatsAppHandlerResponse> } => ({
    whatsApp: {
      key: ["whatsapp-handler"],
      endpoint: `/whatsapp-handler`,
      placeholderData: keepPreviousData,
    },
  }),
  mutation: (
    queryClient?: QueryClient,
  ): {
    updateProfile: UseMutateConfig<UpdateProfileResponse, UpdateProfileBody>;
    changePassword: UseMutateConfig<ChangePasswordResponse, ChangePasswordBody>;
    updateWhatsApp: UseMutateConfig<
      UpdateWhatsAppHandlerResponse,
      UpdateWhatsAppHandlerBody
    >;
  } => ({
    updateProfile: {
      endpoint: "/auth/profile",
      method: "put",
      onSuccess: async ({ data }) => {
        toast.success(data.message);
        if (queryClient) await invalidateQuery(queryClient, [["me"]]);
      },
      onError: { title: "UPDATE_PROFILE" },
    },
    changePassword: {
      endpoint: "/auth/change-password",
      method: "put",
      onSuccess: async ({ data }) => {
        toast.success(data.message);
      },
      onError: { title: "CHANGE_PASSWORD" },
    },
    updateWhatsApp: {
      endpoint: "/whatsapp-handler",
      method: "put",
      onSuccess: async ({ data }) => {
        toast.success(data.message);
        if (queryClient)
          await invalidateQuery(queryClient, [["whatsapp-handler"]]);
      },
      onError: { title: "WHATSAPP_HANDLER" },
    },
  }),
};
