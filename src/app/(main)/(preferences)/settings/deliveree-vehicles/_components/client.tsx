"use client";

import {
  RefreshCw,
  CloudDownload,
  LoaderCircle,
  Power,
  PowerOff,
  X,
} from "lucide-react";
import { useSearchQuery } from "@/hooks/use-search";
import { InputSearch } from "@/components/ui/input-search";
import { SortTable } from "@/components/sort-table";
import {
  parseAsString,
  parseAsStringLiteral,
  useQueryStates,
} from "nuqs";
import { Button } from "@/components/ui/button";
import { TooltipText } from "@/providers/tooltip-provider";
import DataTable from "@/components/ui/data-table";
import { column } from "./columns";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Pagination from "@/components/pagination";
import { usePagination } from "@/hooks/use-pagination";
import { useConfirm } from "@/hooks/use-confirm";
import { useEffect, useState } from "react";
import {
  useBulkUpdateDelivereeVehicle,
  useGetDelivereeVehicleDetail,
  useGetDelivereeVehicleList,
  useSyncDelivereeVehicle,
} from "../_api";
import { SyncResult } from "../_api/types";
import { DialogDetailDelivereeVehicle } from "./_dialog/detail";
import { DialogSyncResult } from "./_dialog/sync-result";

const environmentFilters = [
  { label: "Semua Lingkungan", value: "" },
  { label: "Sandbox", value: "sandbox" },
  { label: "Produksi", value: "production" },
];

export const DelivereeVehicleClient = () => {
  const [dialog, setDialog] = useState<"detail" | "edit" | null>(null);
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);
  const [{ sort, order, id, environment }, setQuery] = useQueryStates(
    {
      id: parseAsString.withDefault(""),
      sort: parseAsString.withDefault("kubikasi_max"),
      order: parseAsString.withDefault("asc"),
      environment: parseAsStringLiteral([
        "",
        "sandbox",
        "production",
      ] as const).withDefault(""),
    },
    { urlKeys: { id: "id" } },
  );

  const [DialogSync, confirmSync] = useConfirm(
    "Sync Data Kendaraan Deliveree",
    "Data kendaraan akan ditarik dari API Deliveree dan memperbarui master data (termasuk menghitung ulang threshold). Lakukan di LUAR JAM KERJA / di luar jam sibuk transaksi, karena perubahan master data dapat memengaruhi pemilihan kendaraan pada pesanan yang sedang berjalan. Lanjutkan?",
  );

  // Konfirmasi bulk enable/disable — title dinamis memakai placeholder [count].
  const [DialogBulkStatus, confirmBulk] = useConfirm(
    "Ubah status [count] kendaraan",
    "Kendaraan terpilih akan diaktifkan/dinonaktifkan. Kendaraan yang NONAKTIF tidak akan dipakai dalam pemilihan kendaraan saat booking baru. Lanjutkan?",
    "destructive",
  );

  const { mutate: sync, isPending: isSyncing } = useSyncDelivereeVehicle();
  const { mutate: bulkStatus, isPending: isBulk } =
    useBulkUpdateDelivereeVehicle();

  const { search, searchValue, setSearch } = useSearchQuery();
  const { page, limit, metaPage, setPage, setLimit, setPaginationData } =
    usePagination();
  const {
    data: list,
    refetch,
    isRefetching,
    isLoading: isLoadList,
  } = useGetDelivereeVehicleList({
    page,
    per_page: limit,
    search: searchValue,
    sort_by: sort,
    order: order as "asc" | "desc",
    environment: environment || undefined,
  });
  const { data: detail } = useGetDelivereeVehicleDetail({ id });

  const vehicleList = list?.data ?? [];
  const isDisabled = isSyncing;

  // === Multi-select untuk bulk enable/disable ===
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const allSelected =
    vehicleList.length > 0 && vehicleList.every((v) => selectedIds.has(v.id));
  const someSelected =
    vehicleList.some((v) => selectedIds.has(v.id)) && !allSelected;

  const toggleSelect = (id: string) =>
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const toggleSelectAll = () =>
    setSelectedIds((prev) => {
      if (allSelected) return new Set();
      const next = new Set(prev);
      vehicleList.forEach((v) => next.add(v.id));
      return next;
    });

  const clearSelection = () => setSelectedIds(new Set());

  const handleBulkStatus = async (isActive: boolean) => {
    const ok = await confirmBulk(String(selectedIds.size));
    if (!ok) return;
    const ids = Array.from(selectedIds);
    bulkStatus(
      { body: { ids, is_active: isActive } },
      {
        onSuccess: () => {
          clearSelection();
          refetch();
        },
      },
    );
  };

  const handleSync = async () => {
    const ok = await confirmSync();
    if (!ok) return;
    sync(
      {},
      {
        onSuccess: ({ data }) => {
          setSyncResult(data.data);
          // Muat ulang list & detail agar data terbaru tampil
          refetch();
        },
      },
    );
  };

  const handleCloseDialog = () => {
    setDialog(null);
    if (id) setQuery({ id: "" });
  };

  useEffect(() => {
    if (list) {
      if (page > list.meta.last_page) {
        setPage(list.meta.last_page);
        return;
      }
      setPaginationData(list.meta);
    }
  }, [list]);

  return (
    <div className="flex flex-col gap-6 pt-4">
      <DialogSync />
      <DialogBulkStatus />
      <DialogSyncResult
        open={!!syncResult}
        onOpenChange={(open) => {
          if (!open) setSyncResult(null);
        }}
        result={syncResult}
      />
      <DialogDetailDelivereeVehicle
        open={!!dialog}
        onOpenChange={(open) => {
          if (!open) handleCloseDialog();
        }}
        mode={dialog}
        detail={detail?.data}
        isDisabled={isDisabled}
      />

      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="leading-none font-semibold text-2xl">
            Kendaraan Deliveree
          </h1>
          <p className="text-sm text-muted-foreground max-w-2xl">
            Master data kendaraan yang dipakai sebagai acuan pemilihan kendaraan
            saat pembuatan booking berdasarkan kriteria kubikasi & berat. Tarik
            data terbaru dari API Deliveree melalui tombol{" "}
            <span className="font-medium text-foreground">Sync Data</span>.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <InputSearch
              placeholder="Cari kendaraan..."
              classNameWrap="w-60"
              value={search}
              setValue={setSearch}
            />
            <Select
              items={environmentFilters}
              value={environment}
              onValueChange={(v) => setQuery({ environment: v ?? "" })}
              disabled={isDisabled}
            >
              <SelectTrigger className="min-w-40">
                <SelectValue placeholder="Semua Lingkungan" />
              </SelectTrigger>
              <SelectContent>
                {environmentFilters.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <TooltipText
              value="Perbarui Data"
              render={
                <Button
                  variant={"outline"}
                  size={"icon"}
                  disabled={isDisabled}
                  onClick={() => refetch()}
                >
                  <RefreshCw
                    className={cn("size-3.5", isRefetching && "animate-spin")}
                  />
                </Button>
              }
            />
            <SortTable
              data={[
                { name: "Nama", value: "nama" },
                { name: "Kubikasi", value: "kubikasi_max" },
                { name: "Berat", value: "berat_max" },
                { name: "Diperbarui", value: "updated_at" },
              ]}
              order={order}
              sort={sort}
              setSort={setQuery}
              disabled={isDisabled}
            />
            <Button
              className={"text-xs"}
              onClick={handleSync}
              disabled={isDisabled}
            >
              {isSyncing ? (
                <LoaderCircle className="size-3.5 animate-spin" />
              ) : (
                <CloudDownload className="size-3.5" />
              )}
              {isSyncing ? "Menyinkronkan..." : "Sync Data"}
            </Button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="flex flex-col gap-4">
        {selectedIds.size > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-muted/40 px-3.5 py-2.5">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium text-foreground">
                {selectedIds.size} kendaraan dipilih
              </span>
              <Button
                variant={"ghost"}
                size={"icon-xs"}
                onClick={clearSelection}
                disabled={isDisabled || isBulk}
                aria-label="Batal pilih semua"
              >
                <X className="size-3.5" />
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={"outline"}
                size={"sm"}
                className={"text-xs"}
                onClick={() => handleBulkStatus(true)}
                disabled={isDisabled || isBulk}
              >
                {isBulk ? (
                  <LoaderCircle className="size-3.5 animate-spin" />
                ) : (
                  <Power className="size-3.5" />
                )}
                Aktifkan ({selectedIds.size})
              </Button>
              <Button
                variant={"destructive"}
                size={"sm"}
                className={"text-xs"}
                onClick={() => handleBulkStatus(false)}
                disabled={isDisabled || isBulk}
              >
                <PowerOff className="size-3.5" />
                Nonaktifkan ({selectedIds.size})
              </Button>
            </div>
          </div>
        )}
        <DataTable
          columns={column({
            metaPage,
            setQuery,
            setDialog,
            disabled: isDisabled || isBulk,
            selection: {
              selectedIds,
              allSelected,
              someSelected,
              onToggle: toggleSelect,
              onToggleAll: toggleSelectAll,
            },
          })}
          data={vehicleList}
          isInitialLoading={isLoadList}
        />
        <Pagination
          pagination={{ ...metaPage, current_page: page, per_page: limit }}
          setPage={setPage}
          setLimit={setLimit}
          disabled={isDisabled}
        />
      </div>
    </div>
  );
};
