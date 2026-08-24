import { useApiQuery } from "@/lib/query/use-query";
import { useMutate } from "@/lib/query";
import { useQueryClient } from "@tanstack/react-query";
import { dataAPIBackups } from "./data";

export const useGetBackupList = () =>
  useApiQuery(dataAPIBackups.query().list);

export const useCreateBackup = () =>
  useMutate(dataAPIBackups.mutation(useQueryClient()).create);

export const useDeleteBackup = () =>
  useMutate(dataAPIBackups.mutation(useQueryClient()).delete);
