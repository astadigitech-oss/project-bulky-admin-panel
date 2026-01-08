import { dataAPIAccount } from "./data";
import { useMutate } from "@/lib/query";
import { useQueryClient } from "@tanstack/react-query";

// mutation
export const useUpdateProfile = () =>
  useMutate(dataAPIAccount.mutation(useQueryClient()).updateProfile);
export const useChangePassword = () =>
  useMutate(dataAPIAccount.mutation().changePassword);
