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
  useActivateForceUpdate,
  useDeleteForceUpdate,
  useGetForceUpdateDetail,
  useGetForceUpdateList,
} from "../_api";
import { useEffect, useState } from "react";
import { DialogFormForceUpdate } from "./_dialog/form";
import { useConfirm } from "@/hooks/use-confirm";

export const ForceUpdateSettingsClient = () => {
  const [open, setOpen] = useState<"edit" | "create">();
  const [{ sort, order, forceUpdateId }, setQuery] = useQueryStates(
    {
      forceUpdateId: parseAsString.withDefault(""),
      sort: parseAsString.withDefault("created_at"),
      order: parseAsString.withDefault("desc"),
    },
    { urlKeys: { forceUpdateId: "id" } },
  );

  const [DialogDelete, confirmDelete] = useConfirm(
    "Hapus [force]",
    "Apakah anda yakin? tindakan ini bersifat permanen",
    "destructive",
  );

  const [DialogStatus, confirmStatus] = useConfirm(
    "[command]",
    "Tindakan tidak bersifat permanen, anda dapat mengubahnya lagi lain kali",
  );

  const { mutate: deleteForceUpdate, isPending: isDeleting } =
    useDeleteForceUpdate();
  const { mutate: activateStatus, isPending: isActivating } =
    useActivateForceUpdate();

  const { search, searchValue, setSearch } = useSearchQuery();
  const { page, limit, metaPage, setPage, setLimit, setPaginationData } =
    usePagination();
  const {
    data: list,
    refetch,
    isRefetching,
    isLoading: isLoadList,
  } = useGetForceUpdateList({
    page,
    per_page: limit,
    search: searchValue,
    sort_by: sort,
    order: order as "asc" | "desc",
  });
  const { data: detail } = useGetForceUpdateDetail({
    id: forceUpdateId,
  });

  const forceUpdateList = list?.data ?? [];
  const isDisabled = isDeleting || isActivating;

  const handleDelete = async (force: string, id: string) => {
    const ok = await confirmDelete(force, "force");
    if (!ok) return;
    deleteForceUpdate({ params: { id } });
  };

  const handleChangeStatus = async (id: string, command: string) => {
    const ok = await confirmStatus(command, "command");
    if (!ok) return;
    activateStatus({ params: { id } });
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
      <DialogFormForceUpdate
        open={!!open}
        onOpenChange={(e) => {
          if (!e) {
            setOpen(undefined);
            if (forceUpdateId) setQuery({ forceUpdateId: "" });
          }
        }}
        mode={open}
        detail={detail?.data}
      />
      <div className="flex items-center justify-between">
        <h1 className="leading-none font-semibold text-2xl">Force Update</h1>
        <div className="flex items-center gap-2">
          <InputSearch
            placeholder="Cari force update..."
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
            Tambah Force Update
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
          data={forceUpdateList}
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
