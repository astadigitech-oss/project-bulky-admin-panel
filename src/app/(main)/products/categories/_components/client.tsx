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
  useChangeStatusCategory,
  useDeleteCategory,
  useGetCategoryDetail,
  useGetCategoryList,
} from "../_api";
import DialogFormCategory from "./_dialog/form";

export const CategoriesProductClient = () => {
  const [open, setOpen] = useState<"edit" | "create" | null>(null);
  const [{ sort, order, categoryId }, setQuery] = useQueryStates(
    {
      categoryId: parseAsString.withDefault(""),
      sort: parseAsString.withDefault("created_at"),
      order: parseAsString.withDefault("desc"),
    },
    { urlKeys: { categoryId: "id" } },
  );

  const [DialogDelete, confirmDelete] = useConfirm(
    "Delete [category]",
    "Apakah anda yakin? tindakan ini bersifat permanen",
    "destructive",
  );

  const [DialogStatus, confirmStatus] = useConfirm(
    "[command]",
    "Tindakan tidak bersifat permanen, anda dapat mengubahnya lagi lain kali",
  );

  const { mutate: deleteCategory, isPending: isDeleting } = useDeleteCategory();
  const { mutate: updateStatus, isPending: isUpdatingStatus } =
    useChangeStatusCategory();

  const { search, searchValue, setSearch } = useSearchQuery();
  const { page, limit, metaPage, setPage, setLimit, setPaginationData } =
    usePagination();
  const {
    data: list,
    refetch,
    isRefetching,
    isLoading: isLoadList,
  } = useGetCategoryList({
    page,
    per_page: limit,
    search: searchValue,
    sort_by: sort,
    order: order as "asc" | "desc",
  });
  const { data: detail } = useGetCategoryDetail({
    id: categoryId,
  });

  const categoriesList = list?.data ?? [];
  const isDisabled = isDeleting || isUpdatingStatus;

  const handleDelete = async (user: string, userId: string) => {
    const ok = await confirmDelete(user, "category");
    if (!ok) return;
    deleteCategory({ params: { id: userId } });
  };

  const handleChangeStatus = async (
    command: string,
    userId: string,
    variant: VariantProps<typeof buttonVariants>["variant"],
  ) => {
    const ok = await confirmStatus(command, "command", variant);
    if (!ok) return;
    updateStatus({ params: { id: userId } });
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
      <DialogFormCategory
        open={!!open}
        onOpenChange={(e) => {
          if (!e) {
            setOpen(null);
            if (categoryId) setQuery({ categoryId: "" });
          }
        }}
        mode={open}
        detail={detail?.data}
        isDisabled={isDisabled}
      />
      <div className="flex items-center justify-between">
        <h1 className="leading-none font-semibold text-2xl">Kategori</h1>
        <div className="flex items-center gap-2">
          <InputSearch
            placeholder="Cari kategori..."
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
            Tambah Kategori
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
          data={categoriesList}
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
