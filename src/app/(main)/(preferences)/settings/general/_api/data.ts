import { invalidateQuery } from "@/lib/query";
import { UseMutateConfig } from "@/lib/query/types";
import { keepPreviousData, QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ChangePasswordBody,
  ChangePasswordResponse,
  GetPaymentResponse,
  GetScheduleResponse,
  GetWarehouseResponse,
  ImportV1Body,
  ImportV1Response,
  PruneOrphansBody,
  PruneOrphansResponse,
  UpdatePaymentParams,
  UpdatePaymentResponse,
  UpdateProfileBody,
  UpdateProfileResponse,
  UpdateScheduleBody,
  UpdateScheduleResponse,
  UpdateWarehouseBody,
  UpdateWarehouseResponse,
  UpdateWhatsAppHandlerBody,
  UpdateWhatsAppHandlerResponse,
  WhatsAppHandlerResponse,
} from "./types";
import { UseApiQueryProps } from "@/lib/query/use-query";

const key = [
  "whatsapp-handler",
  "warehouse-info",
  "schedule-pickup",
  "payment-method",
];

// data
export const dataAPIGeneral = {
  query: (): {
    whatsApp: UseApiQueryProps<WhatsAppHandlerResponse>;
    warehouse: UseApiQueryProps<GetWarehouseResponse>;
    schedule: UseApiQueryProps<GetScheduleResponse>;
    payment: UseApiQueryProps<GetPaymentResponse>;
  } => ({
    whatsApp: {
      key: [key[0]],
      endpoint: `/whatsapp-handler`,
      placeholderData: keepPreviousData,
    },
    warehouse: {
      key: [key[1]],
      endpoint: `/warehouse`,
      placeholderData: keepPreviousData,
    },
    schedule: {
      key: [key[2]],
      endpoint: `/informasi-pickup/jadwal`,
      placeholderData: keepPreviousData,
    },
    payment: {
      key: [key[3]],
      endpoint: `/metode-pembayaran`,
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
    updateWarehouse: UseMutateConfig<
      UpdateWarehouseResponse,
      UpdateWarehouseBody
    >;
    updateSchedule: UseMutateConfig<UpdateScheduleResponse, UpdateScheduleBody>;
    updatePayment: UseMutateConfig<
      UpdatePaymentResponse,
      undefined,
      UpdatePaymentParams
    >;
    importV1: UseMutateConfig<ImportV1Response, ImportV1Body>;
    pruneOrphans: UseMutateConfig<PruneOrphansResponse, PruneOrphansBody>;
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
        if (queryClient) await invalidateQuery(queryClient, [[key[0]]]);
      },
      onError: { title: "WHATSAPP_HANDLER" },
    },
    updateWarehouse: {
      endpoint: "/warehouse",
      method: "put",
      onSuccess: async ({ data }) => {
        toast.success(data.message);
        if (queryClient) await invalidateQuery(queryClient, [[key[1]]]);
      },
      onError: { title: "WAREHOUSE_INFO" },
    },
    updateSchedule: {
      endpoint: `/informasi-pickup/jadwal`,
      method: "put",
      onSuccess: async ({ data }) => {
        toast.success(data.message);
        if (queryClient) await invalidateQuery(queryClient, [[key[2]]]);
      },
      onError: { title: "SCHEDULE_PICKUP" },
    },
    updatePayment: {
      endpoint: `/metode-pembayaran/:id/toggle-status`,
      method: "patch",
      onSuccess: async ({ data }) => {
        toast.success(data.message);
        if (queryClient) await invalidateQuery(queryClient, [[key[3]]]);
      },
      onError: { title: "PAYMENT_METHOD" },
    },
    importV1: {
      endpoint: `/assets/import-v1`,
      method: "post",
      onSuccess: async ({ data }) => {
        toast.success(data.message);
      },
      onError: { title: "IMPORT_ASSETS_V1" },
    },
    pruneOrphans: {
      endpoint: `/assets/prune-orphans`,
      method: "post",
      onSuccess: async ({ data }) => {
        toast.success(data.message);
      },
      onError: { title: "PRUNE_ORPHANS" },
    },
  }),
};
