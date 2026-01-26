"use client";

import { Plus, RefreshCw } from "lucide-react";
import { useSearchQuery } from "@/hooks/use-search";
import { InputSearch } from "@/components/ui/input-search";
import { SortTable } from "@/components/sort-table";
import { parseAsString, useQueryStates } from "nuqs";
import { Button } from "@/components/ui/button";
import { TooltipText } from "@/providers/tooltip-provider";
import DataTable from "@/components/ui/data-table";
import { column } from "./columns";
import { cn } from "@/lib/utils";
import Pagination from "@/components/pagination";
import { usePagination } from "@/hooks/use-pagination";
import {
  useActivateMaintenance,
  useDeactivateMaintenance,
  useDeleteMaintenance,
  useGetMaintenanceDetail,
  useGetMaintenanceList,
} from "../_api";
import { useEffect, useState } from "react";
import { DialogFormMaintenance } from "./_dialog/form";
import { useConfirm } from "@/hooks/use-confirm";

export const MaintenanceSettingsClient = () => {
  const [open, setOpen] = useState<"edit" | "create">();
  const [{ sort, order, maintenanceId }, setQuery] = useQueryStates(
    {
      maintenanceId: parseAsString.withDefault(""),
      sort: parseAsString.withDefault("created_at"),
      order: parseAsString.withDefault("desc"),
    },
    { urlKeys: { maintenanceId: "id" } },
  );

  const [DialogDelete, confirmDelete] = useConfirm(
    "Hapus [user]",
    "Apakah anda yakin? tindakan ini bersifat permanen",
    "destructive",
  );

  const [DialogStatus, confirmStatus] = useConfirm(
    "[command]",
    "Tindakan tidak bersifat permanen, anda dapat mengubahnya lagi lain kali",
  );

  const { mutate: deleteMaintenance, isPending: isDeleting } =
    useDeleteMaintenance();
  const { mutate: activateStatus, isPending: isActivating } =
    useActivateMaintenance();
  const { mutate: deactivateStatus, isPending: isDeactivating } =
    useDeactivateMaintenance();

  const { search, searchValue, setSearch } = useSearchQuery();
  const { page, limit, metaPage, setPage, setLimit, setPaginationData } =
    usePagination();
  const {
    data: list,
    refetch,
    isRefetching,
    isLoading: isLoadList,
  } = useGetMaintenanceList({
    page,
    per_page: limit,
    search: searchValue,
    sort_by: sort,
    order: order as "asc" | "desc",
  });
  const { data: detail } = useGetMaintenanceDetail({
    id: maintenanceId,
  });

  const MaintenanceList = list?.data ?? [];
  const isDisabled = isDeleting || isActivating || isDeactivating;

  const handleDelete = async (user: string, userId: string) => {
    const ok = await confirmDelete(user, "user");
    if (!ok) return;
    deleteMaintenance({ params: { id: userId } });
  };

  const handleChangeStatus = async (
    id: string,
    command: string,
    status: "active" | "deactive",
  ) => {
    const ok = await confirmStatus(
      command,
      "command",
      status === "active" ? "destructive" : "default",
    );
    if (!ok) return;
    if (status === "active") {
      activateStatus({ params: { id } });
    } else {
      deactivateStatus({ params: { id } });
    }
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
      <DialogStatus />
      <DialogDelete />
      <DialogFormMaintenance
        open={!!open}
        onOpenChange={(e) => {
          if (!e) {
            setOpen(undefined);
            if (maintenanceId) setQuery({ maintenanceId: "" });
          }
        }}
        mode={open}
        detail={detail?.data}
      />
      <div className="flex items-center justify-between">
        <h1 className="leading-none font-semibold text-2xl">Maintenance</h1>
        <div className="flex items-center gap-2">
          <InputSearch
            placeholder="Cari maintenance..."
            classNameWrap="w-60"
            value={search}
            setValue={setSearch}
          />
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
            data={[]}
            order={order}
            sort={sort}
            setSort={setQuery}
            disabled={isDisabled}
          />
          <Button
            className={"text-xs"}
            onClick={() => setOpen("create")}
            disabled={isDisabled}
          >
            <Plus className="size-3.5" />
            Tambah Maintenance
          </Button>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <DataTable
          columns={column({
            metaPage,
            setOpen,
            setQuery,
            handleDelete,
            handleChangeStatus,
            disabled: isDisabled,
          })}
          data={MaintenanceList}
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
