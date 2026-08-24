"use client";

import React, { useMemo, useState } from "react";
import {
  Clock,
  Database,
  HardDrive,
  History,
  LoaderCircle,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { InputSearch } from "@/components/ui/input-search";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TooltipText } from "@/providers/tooltip-provider";
import { useConfirm } from "@/hooks/use-confirm";
import { useSearchQuery } from "@/hooks/use-search";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { toast } from "sonner";
import axios from "axios";
import { apiUrl, cookiesKey } from "@/config";
import { getCookie } from "cookies-next/client";
import {
  useCreateBackup,
  useDeleteBackup,
  useGetBackupList,
} from "../_api";
import { column } from "./columns";

const triggerFilters = [
  { label: "Semua Tipe", value: "all" },
  { label: "Otomatis", value: "AUTO" },
  { label: "Manual", value: "MANUAL" },
];

export const BackupClient = () => {
  const { search, searchValue, setSearch } = useSearchQuery();
  const [triggerFilter, setTriggerFilter] = useState("all");

  const {
    data: listData,
    refetch,
    isRefetching,
    isLoading,
  } = useGetBackupList();

  const { mutate: createBackup, isPending: isCreating } = useCreateBackup();
  const { mutate: deleteBackup, isPending: isDeleting } = useDeleteBackup();

  const [DialogCreate, confirmCreate] = useConfirm(
    "Buat Backup Database Sekarang",
    "Sistem akan membuat snapshot dump database PostgreSQL saat ini dan mengompresinya ke format .sql.gz. Proses ini berjalan non-blocking di latar belakang.",
    "default",
  );

  const [DialogDelete, confirmDelete] = useConfirm(
    "Hapus File Backup",
    "Apakah Anda yakin ingin menghapus file backup [filename]? Tindakan ini tidak dapat dibatalkan.",
    "destructive",
  );

  const items = listData?.data?.items ?? [];
  const stats = listData?.data?.stats;

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchSearch =
        !searchValue ||
        item.filename.toLowerCase().includes(searchValue.toLowerCase());
      const matchTrigger =
        triggerFilter === "all" || item.trigger_type === triggerFilter;
      return matchSearch && matchTrigger;
    });
  }, [items, searchValue, triggerFilter]);

  const isDisabled = isCreating || isDeleting || isRefetching;

  const handleCreate = async () => {
    const ok = await confirmCreate();
    if (!ok) return;

    createBackup(
      { body: undefined },
      {
        onSuccess: () => {
          refetch();
        },
      },
    );
  };

  const handleDelete = async (filename: string) => {
    const ok = await confirmDelete(filename, "filename");
    if (!ok) return;

    deleteBackup(
      { params: { filename } },
      {
        onSuccess: () => {
          refetch();
        },
      },
    );
  };

  const handleDownload = async (filename: string) => {
    const toastId = "download-backup-" + filename;
    try {
      toast.loading(`Mengunduh ${filename}...`, { id: toastId });
      const token = getCookie(cookiesKey);
      const res = await axios.get(
        `${apiUrl}/backups/${encodeURIComponent(filename)}/download`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: "blob",
        },
      );

      const blobUrl = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = blobUrl;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);

      toast.success(`Berhasil mengunduh ${filename}`, { id: toastId });
    } catch (err: any) {
      toast.error("Gagal mengunduh file backup", { id: toastId });
    }
  };

  return (
    <div className="flex flex-col gap-6 pt-4">
      <DialogCreate />
      <DialogDelete />

      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="leading-none font-semibold text-2xl">
              Backup Database
            </h1>
            <p className="text-sm text-muted-foreground max-w-2xl">
              Kelola riwayat backup database PostgreSQL harian, buat snapshot
              manual sewaktu-waktu, dan unduh arsip dump terkompresi (.sql.gz).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <TooltipText
              value="Perbarui Data"
              render={
                <Button
                  variant="outline"
                  size="icon"
                  disabled={isDisabled}
                  onClick={() => refetch()}
                >
                  <RefreshCw
                    className={cn("size-3.5", isRefetching && "animate-spin")}
                  />
                </Button>
              }
            />
            <Button
              className="text-xs gap-1.5"
              onClick={handleCreate}
              disabled={isDisabled}
            >
              {isCreating ? (
                <LoaderCircle className="size-3.5 animate-spin" />
              ) : (
                <Database className="size-3.5" />
              )}
              {isCreating ? "Membuat Backup..." : "Backup Sekarang"}
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-card/50">
            <CardContent className="p-4 flex items-center gap-3.5">
              <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <History className="size-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground font-medium">
                  Total File Backup
                </span>
                <span className="text-lg font-bold tabular-nums">
                  {stats?.total_files ?? items.length} File
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50">
            <CardContent className="p-4 flex items-center gap-3.5">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <HardDrive className="size-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground font-medium">
                  Total Ukuran Storage
                </span>
                <span className="text-lg font-bold tabular-nums">
                  {stats?.total_size_formatted ?? "0 B"}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50">
            <CardContent className="p-4 flex items-center gap-3.5">
              <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                <ShieldCheck className="size-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground font-medium">
                  Retensi Otomatis
                </span>
                <span className="text-lg font-bold tabular-nums">
                  {stats?.retention_days ?? 7} Hari
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50">
            <CardContent className="p-4 flex items-center gap-3.5">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Clock className="size-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground font-medium">
                  Jadwal Berikutnya
                </span>
                <span className="text-xs font-semibold mt-1">
                  {stats?.next_scheduled_run
                    ? format(
                        new Date(stats.next_scheduled_run),
                        "dd MMM, HH:mm",
                        { locale: idLocale },
                      ) + " WIB"
                    : "00:00 WIB"}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2">
            <InputSearch
              placeholder="Cari nama file backup..."
              classNameWrap="w-64"
              value={search}
              setValue={setSearch}
            />
            <Select
              items={triggerFilters}
              value={triggerFilter}
              onValueChange={(v) => setTriggerFilter(v ?? "all")}
              disabled={isDisabled}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Semua Tipe" />
              </SelectTrigger>
              <SelectContent>
                {triggerFilters.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={column({
          handleDownload,
          handleDelete,
          disabled: isDisabled,
        })}
        data={filteredItems}
        isInitialLoading={isLoading}
      />
    </div>
  );
};
