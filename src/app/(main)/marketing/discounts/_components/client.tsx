"use client";

import { InputSearch } from "@/components/ui/input-search";
import { useSearchQuery } from "@/hooks/use-search";
import { parseAsString, useQueryStates } from "nuqs";
import { usePagination } from "@/hooks/use-pagination";
import { useEffect, useState } from "react";
import DataTable from "@/components/ui/data-table";
import Pagination from "@/components/pagination";
import { Button, buttonVariants } from "@/components/ui/button";
import { TooltipText } from "@/providers/tooltip-provider";
import { Plus, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { SortTable } from "@/components/sort-table";
import { column } from "./columns";
import {
  useDeleteCoupon,
  useGetCouponCategorySelect,
  useGetCouponDetail,
  useGetCouponList,
  useToggleStatusCoupon,
} from "../_api";
import { DialogFormCoupon } from "./_dialog/form";
import { useConfirm } from "@/hooks/use-confirm";
import { VariantProps } from "class-variance-authority";
import { DialogCouponUsages } from "./_dialog/usages";

export const DiscountMarketingClient = () => {
  const [open, setOpen] = useState<"edit" | "create" | null>(null);
  const [usageCouponId, setUsageCouponId] = useState<string | null>(null);

  const [{ sort, order, couponId }, setQuery] = useQueryStates(
    {
      couponId: parseAsString.withDefault(""),
      sort: parseAsString.withDefault("updated_at"),
      order: parseAsString.withDefault("desc"),
    },
    { urlKeys: { couponId: "id" } },
  );

  const [DialogDelete, confirmDelete] = useConfirm(
    "Delete [kupon]",
    "Apakah anda yakin? tindakan ini bersifat permanen",
    "destructive",
  );

  const [DialogStatus, confirmStatus] = useConfirm(
    "[command]",
    "Tindakan tidak bersifat permanen, anda dapat mengubahnya lagi lain kali",
  );

  const { mutate: deleteCoupon, isPending: isDeleting } = useDeleteCoupon();
  const { mutate: toggleStatus, isPending: isToggling } =
    useToggleStatusCoupon();

  const { search, searchValue, setSearch } = useSearchQuery();
  const { page, limit, metaPage, setPage, setLimit, setPaginationData } =
    usePagination();

  const {
    data: list,
    refetch,
    isRefetching,
    isLoading: isLoadList,
  } = useGetCouponList({
    page,
    per_page: limit,
    search: searchValue,
    sort_by: sort,
    order: order as "asc" | "desc",
  });

  const { data: detail } = useGetCouponDetail({ id: couponId });
  const { data: categorySelect } = useGetCouponCategorySelect();

  const isDisabled = isRefetching || isDeleting || isToggling;

  const handleDelete = async (name: string, id: string) => {
    const ok = await confirmDelete(name, "kupon");
    if (!ok) return;
    deleteCoupon({ params: { id } });
  };

  const handleToggleStatus = async (
    command: string,
    id: string,
    variant: VariantProps<typeof buttonVariants>["variant"],
  ) => {
    const ok = await confirmStatus(command, "command", variant);
    if (!ok) return;
    toggleStatus({ params: { id } });
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
      <DialogDelete />
      <DialogStatus />
      <DialogFormCoupon
        open={!!open}
        onOpenChange={(e) => {
          if (!e) {
            setOpen(null);
            if (couponId) setQuery({ couponId: "" });
          }
        }}
        mode={open}
        detail={detail?.data}
        categories={categorySelect?.data ?? []}
        isDisabled={isDisabled}
      />
      <DialogCouponUsages
        open={!!usageCouponId}
        onOpenChange={(e) => {
          if (!e) setUsageCouponId(null);
        }}
        couponId={usageCouponId ?? undefined}
      />

      <div className="flex items-center justify-between">
        <h1 className="leading-none font-semibold text-2xl">Kupon Diskon</h1>
        <div className="flex items-center gap-2">
          <InputSearch
            placeholder="Cari kupon..."
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
            className="text-xs"
            onClick={() => setOpen("create")}
            disabled={isDisabled}
          >
            <Plus className="size-3.5" />
            Tambah Kupon
          </Button>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-lg border p-4">
          <div className="text-muted-foreground text-xs">
            Total Kupon (page ini)
          </div>
          <div className="text-xl font-semibold">{list?.data.length ?? 0}</div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-muted-foreground text-xs">Total Data Kupon</div>
          <div className="text-xl font-semibold">{list?.meta.total ?? 0}</div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-muted-foreground text-xs">Kategori Tersedia</div>
          <div className="text-xl font-semibold">
            {categorySelect?.data.length ?? 0}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <DataTable
          columns={column({
            setOpen,
            setUsageCouponId,
            metaPage,
            setQuery,
            handleDelete,
            handleToggleStatus,
            disabled: isDisabled,
          })}
          data={list?.data ?? []}
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
