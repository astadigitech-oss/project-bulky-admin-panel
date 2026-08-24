import { invalidateQuery } from "@/lib/query";
import { UseMutateConfig } from "@/lib/query/types";
import { UseApiQueryProps } from "@/lib/query/use-query";
import { BaseResponse } from "@/lib/types";
import { QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export type BackupItem = {
  filename: string;
  size_bytes: number;
  size_formatted: string;
  created_at: string;
  trigger_type: "AUTO" | "MANUAL";
  download_url: string;
};

export type BackupStorageStats = {
  total_files: number;
  total_size_bytes: number;
  total_size_formatted: string;
  retention_days: number;
  backup_path: string;
  next_scheduled_run?: string;
};

export type BackupListResponse = BaseResponse & {
  data: {
    items: BackupItem[];
    stats: BackupStorageStats;
  };
};

export type CreateBackupResponse = BaseResponse & {
  data: BackupItem;
};

export type DeleteBackupParams = {
  filename: string;
};

const key = ["backup-list"];

export const dataAPIBackups = {
  query: (): {
    list: UseApiQueryProps<BackupListResponse>;
  } => ({
    list: {
      key: [key[0]],
      endpoint: `/backups`,
    },
  }),
  mutation: (
    queryClient?: QueryClient,
  ): {
    create: UseMutateConfig<CreateBackupResponse, undefined>;
    delete: UseMutateConfig<BaseResponse, undefined, DeleteBackupParams>;
  } => ({
    create: {
      endpoint: "/backups",
      method: "post",
      onSuccess: async ({ data }) => {
        toast.success(data.message || "Backup database berhasil dibuat");
        if (queryClient) {
          await invalidateQuery(queryClient, [[key[0]]]);
        }
      },
      onError: { title: "CREATE_BACKUP" },
    },
    delete: {
      endpoint: "/backups/:filename",
      method: "delete",
      onSuccess: async ({ data }) => {
        toast.success(data.message || "File backup berhasil dihapus");
        if (queryClient) {
          await invalidateQuery(queryClient, [[key[0]]]);
        }
      },
      onError: { title: "DELETE_BACKUP" },
    },
  }),
};
