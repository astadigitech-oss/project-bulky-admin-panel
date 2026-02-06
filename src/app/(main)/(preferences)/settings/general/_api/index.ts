import { dataAPIGeneral } from "./data";
import { useMutate } from "@/lib/query";
import { useApiQuery } from "@/lib/query/use-query";
import { useQueryClient } from "@tanstack/react-query";

// query
export const useGetWhatsApp = () =>
  useApiQuery(dataAPIGeneral.query().whatsApp);
export const useGetWarehouse = () =>
  useApiQuery(dataAPIGeneral.query().warehouse);
export const useGetSchedule = () =>
  useApiQuery(dataAPIGeneral.query().schedule);
export const useGetPayment = () => useApiQuery(dataAPIGeneral.query().payment);

// mutation
export const useWhatsAppHandler = () =>
  useMutate(dataAPIGeneral.mutation(useQueryClient()).updateWhatsApp);
export const useUpdateProfile = () =>
  useMutate(dataAPIGeneral.mutation(useQueryClient()).updateProfile);
export const useChangePassword = () =>
  useMutate(dataAPIGeneral.mutation().changePassword);
export const useUpdateWarehouse = () =>
  useMutate(dataAPIGeneral.mutation(useQueryClient()).updateWarehouse);
export const useUpdateSchedule = () =>
  useMutate(dataAPIGeneral.mutation(useQueryClient()).updateSchedule);
export const useUpdatePayment = () =>
  useMutate(dataAPIGeneral.mutation(useQueryClient()).updatePayment);
