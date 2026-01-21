"use client";

import { Plus, RefreshCw } from "lucide-react";
import { useSearchQuery } from "@/hooks/use-search";
import { InputSearch } from "@/components/ui/input-search";
import { SortTable } from "@/components/sort-table";
import { parseAsString, useQueryStates } from "nuqs";
import { Button, buttonVariants } from "@/components/ui/button";
import { TooltipText } from "@/providers/tooltip-provider";
import DataTable from "@/components/ui/data-table";
import { column } from "./columns";
import { cn } from "@/lib/utils";
import Pagination from "@/components/pagination";
import { usePagination } from "@/hooks/use-pagination";
import { useEffect, useState } from "react";
import { useConfirm } from "@/hooks/use-confirm";
import { VariantProps } from "class-variance-authority";
import {
  useChangeStatusPackageCondition,
  useDeletePackageCondition,
  useGetPackageConditionDetail,
  useGetPackageConditionList,
  useReorderPackageCondition,
} from "../_api";
import DialogFormPackageCondition from "./_dialog/form";

export const PackageConditionProductClient = () => {
  const [open, setOpen] = useState<"edit" | "create" | null>(null);
  const [{ sort, order, packageConditionId }, setQuery] = useQueryStates(
    {
      packageConditionId: parseAsString.withDefault(""),
      sort: parseAsString.withDefault("created_at"),
      order: parseAsString.withDefault("desc"),
    },
    { urlKeys: { packageConditionId: "id" } },
  );

  const [DialogDelete, confirmDelete] = useConfirm(
    "Delete [PackageCondition]",
    "Apakah anda yakin? tindakan ini bersifat permanen",
    "destructive",
  );

  const [DialogStatus, confirmStatus] = useConfirm(
    "[command]",
    "Tindakan tidak bersifat permanen, anda dapat mengubahnya lagi lain kali",
  );

  const { mutate: deletePackageCondition, isPending: isDeleting } =
    useDeletePackageCondition();
  const { mutate: updateStatus, isPending: isUpdatingStatus } =
    useChangeStatusPackageCondition();
  const { mutate: reorderStatus, isPending: isReordering } =
    useReorderPackageCondition();

  const { search, searchValue, setSearch } = useSearchQuery();
  const { page, limit, metaPage, setPage, setLimit, setPaginationData } =
    usePagination();
  const {
    data: list,
    refetch,
    isRefetching,
    isLoading: isLoadList,
  } = useGetPackageConditionList({
    page,
    per_page: limit,
    search: searchValue,
    sort_by: sort,
    order: order as "asc" | "desc",
  });
  const { data: detail } = useGetPackageConditionDetail({
    id: packageConditionId,
  });

  const packageContionList = list?.data ?? [];
  const isDisabled = isDeleting || isUpdatingStatus || isReordering;

  const handleDelete = async (user: string, id: string) => {
    const ok = await confirmDelete(user, "PackageCondition");
    if (!ok) return;
    deletePackageCondition({ params: { id } });
  };

  const handleChangeStatus = async (
    command: string,
    id: string,
    variant: VariantProps<typeof buttonVariants>["variant"],
  ) => {
    const ok = await confirmStatus(command, "command", variant);
    if (!ok) return;
    updateStatus({ params: { id } });
  };

  const handleReorder = (id: string, direction: "up" | "down") => {
    reorderStatus({ params: { id }, body: { direction } });
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
      <DialogFormPackageCondition
        open={!!open}
        onOpenChange={(e) => {
          if (!e) {
            setOpen(null);
            if (packageConditionId) setQuery({ packageConditionId: "" });
          }
        }}
        mode={open}
        detail={detail?.data}
        isDisabled={isDisabled}
      />
      <div className="flex items-center justify-between">
        <h1 className="leading-none font-semibold text-2xl">Kondisi Paket</h1>
        <div className="flex items-center gap-2">
          <InputSearch
            placeholder="Cari kondisi paket..."
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
            Tambah Kondisi Paket
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
            handleReorder,
            disabled: isDisabled,
          })}
          data={packageContionList}
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
