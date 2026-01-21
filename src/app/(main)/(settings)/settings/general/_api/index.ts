import { dataAPIGeneral } from "./data";
import { useMutate } from "@/lib/query";
import { useApiQuery } from "@/lib/query/use-query";
import { useQueryClient } from "@tanstack/react-query";

// query
export const useGetWhatsApp = () =>
  useApiQuery(dataAPIGeneral.query().whatsApp);

// mutation
export const useWhatsAppHandler = () =>
  useMutate(dataAPIGeneral.mutation(useQueryClient()).updateWhatsApp);
export const useUpdateProfile = () =>
  useMutate(dataAPIGeneral.mutation(useQueryClient()).updateProfile);
export const useChangePassword = () =>
  useMutate(dataAPIGeneral.mutation().changePassword);
