"use client";

import { ArrowDown, ArrowUp, Check, CheckCheck, PlusCircle, RefreshCw, XCircle } from "lucide-react";
import { useSearchQuery } from "@/hooks/use-search";
import { InputSearch } from "@/components/ui/input-search";
import { parseAsString, useQueryStates } from "nuqs";
import { Button } from "@/components/ui/button";
import { TooltipText } from "@/providers/tooltip-provider";
import DataTable from "@/components/ui/data-table";
import { createColumns } from "./columns";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import {
  useApproveReview,
  useBulkApproveReview,
  useDeleteReview,
  useGetReviewList,
  useRejectReview,
} from "../_api";
import { usePagination } from "@/hooks/use-pagination";
import Pagination from "@/components/pagination";
import { useConfirm } from "@/hooks/use-confirm";
import { ReviewDetailSheet } from "./detail-sheet";

const STATUS_OPTIONS = [
  { label: "Publik", value: true },
  { label: "Arsip", value: false },
] as const;

export const OrderReviewsClient = () => {
  const [{ sort, order }, setQuery] = useQueryStates({
    sort: parseAsString.withDefault("created_at"),
    order: parseAsString.withDefault("desc"),
  });

  const { search, setSearch } = useSearchQuery();
  const { page, limit, metaPage, setPage, setLimit, setPaginationData } =
    usePagination();

  const [selectedStatus, setSelectedStatus] = useState<boolean | undefined>(
    undefined,
  );
  const [appliedRating, setAppliedRating] = useState<number | undefined>(
    undefined,
  );
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [detailId, setDetailId] = useState<string | null>(null);

  const [DialogApprove, confirmApprove] = useConfirm(
    "Setujui Ulasan",
    "Ulasan akan dipublikasikan dan terlihat oleh pembeli.",
    "default",
  );
  const [DialogReject, confirmReject] = useConfirm(
    "Tolak Ulasan",
    "Ulasan akan diarsipkan dan tidak terlihat oleh pembeli.",
    "destructive",
  );
  const [DialogDelete, confirmDelete] = useConfirm(
    "Hapus Ulasan",
    "Apakah anda yakin ingin menghapus ulasan ini? Tindakan ini bersifat permanen.",
    "destructive",
  );
  const [DialogBulkApprove, confirmBulkApprove] = useConfirm(
    "Bulk Approve Ulasan",
    `${selectedIds.length} ulasan terpilih akan dipublikasikan.`,
    "default",
  );

  const { mutate: approveReview } = useApproveReview();
  const { mutate: rejectReview } = useRejectReview();
  const { mutate: bulkApprove } = useBulkApproveReview();
  const { mutate: deleteReview } = useDeleteReview();

  const {
    data: listData,
    refetch,
    isRefetching,
    isLoading,
  } = useGetReviewList({
    page: page ?? 1,
    per_page: limit ?? 10,
    cari: search || undefined,
    is_approved: selectedStatus,
    rating: appliedRating,
    sort_by: sort,
    sort_order: order as "asc" | "desc",
    enabled: page !== null && limit !== null,
  });

  const reviews = listData?.data ?? [];
  const allIds = reviews.map((r) => r.id);

  useEffect(() => {
    if (listData) {
      if (page > listData.meta.last_page) {
        setPage(listData.meta.last_page);
        return;
      }
      setPaginationData(listData.meta);
    }
  }, [listData]);

  const clearSelection = () => setSelectedIds([]);

  const handleSearchChange: typeof setSearch = (value, options) => {
    clearSelection();
    return setSearch(value, options);
  };

  const handleStatusChange = (value: boolean | undefined) => {
    clearSelection();
    setSelectedStatus(value);
  };

  const handleRatingChange = (value: number | undefined) => {
    clearSelection();
    setAppliedRating(value);
  };

  const handlePageChange = (nextPage: number) => {
    clearSelection();
    setPage(nextPage);
  };

  const handleLimitChange = (nextLimit: number) => {
    clearSelection();
    setLimit(nextLimit);
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleToggleAll = (ids: string[]) => setSelectedIds(ids);

  const handleApprove = async (id: string) => {
    const ok = await confirmApprove();
    if (!ok) return;
    approveReview({ params: { id } });
  };

  const handleReject = async (id: string) => {
    const ok = await confirmReject();
    if (!ok) return;
    rejectReview({ params: { id } });
  };

  const handleDelete = async (id: string) => {
    const ok = await confirmDelete();
    if (!ok) return;
    deleteReview({ params: { id } });
  };

  const handleBulkApprove = async () => {
    const ok = await confirmBulkApprove();
    if (!ok) return;
    bulkApprove({ body: { ids: selectedIds } });
    setSelectedIds([]);
  };

  const handleResetFilters = () => {
    clearSelection();
    setSelectedStatus(undefined);
    setAppliedRating(undefined);
    setSearch("");
  };

  const hasActiveFilters =
    selectedStatus !== undefined || appliedRating !== undefined || !!search;

  const columns = createColumns({
    selectedIds,
    allIds,
    onToggleSelect: handleToggleSelect,
    onToggleAll: handleToggleAll,
    onDetail: (id) => setDetailId(id),
    onApprove: handleApprove,
    onReject: handleReject,
    onDelete: handleDelete,
  });

  return (
    <div className="flex flex-col gap-6 pt-4">
      <DialogApprove />
      <DialogReject />
      <DialogDelete />
      <DialogBulkApprove />
      <ReviewDetailSheet reviewId={detailId} onClose={() => setDetailId(null)} />

      <div className="flex items-center justify-between">
        <h1 className="leading-none font-semibold text-2xl">Ulasan</h1>
        <div className="flex items-center gap-2">
          <InputSearch
            placeholder="Cari ulasan..."
            classNameWrap="w-60"
            value={search}
            setValue={handleSearchChange}
          />
          <TooltipText
            value="Perbarui Data"
            render={
              <Button
                variant={"outline"}
                size={"icon"}
                onClick={() => refetch()}
                disabled={isRefetching}
              >
                <RefreshCw className={cn(isRefetching && "animate-spin")} />
              </Button>
            }
          />
          <TooltipText
            value={order === "asc" ? "Urutan Menaik" : "Urutan Menurun"}
            render={
              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  setQuery({ order: order === "asc" ? "desc" : "asc" })
                }
              >
                {order === "asc" ? (
                  <ArrowUp className="size-3.5" />
                ) : (
                  <ArrowDown className="size-3.5" />
                )}
              </Button>
            }
          />
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            {/* Filter Status */}
            <Popover>
              <PopoverTrigger
                render={
                  <button className="flex items-center border border-gray-300 dark:border-gray-300/50 border-dashed rounded-md h-8 hover:bg-yellow-200 dark:hover:bg-yellow-300/30 transition cursor-default group">
                    <div className="text-xs font-medium h-full py-0 px-3 flex items-center gap-2">
                      <PlusCircle className="size-3" />
                      Status
                    </div>
                    {selectedStatus !== undefined && (
                      <>
                        <Separator
                          orientation="vertical"
                          className="data-[orientation=vertical]:h-full dark:bg-gray-500/50"
                        />
                        <div
                          className={cn(
                            "text-xs font-medium rounded-sm mx-2 px-2 py-0.5 flex items-center justify-center",
                            "bg-yellow-200 dark:bg-yellow-300/30 dark:group-hover:bg-transparent",
                          )}
                        >
                          {selectedStatus ? "Publik" : "Arsip"}
                        </div>
                      </>
                    )}
                  </button>
                }
              />
              <PopoverContent
                portal={{ keepMounted: true }}
                className="p-0 w-36"
                align="start"
              >
                <Command className="p-0">
                  <CommandGroup>
                    {STATUS_OPTIONS.map((opt) => {
                      const isSelected = selectedStatus === opt.value;
                      return (
                        <CommandItem
                          key={String(opt.value)}
                          className="text-xs"
                          onSelect={() =>
                            handleStatusChange(
                              isSelected ? undefined : opt.value,
                            )
                          }
                        >
                          <div
                            className={cn(
                              "flex h-4 w-4 items-center justify-center rounded-sm border",
                              isSelected
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-gray-500/50 opacity-50 [&_svg]:invisible",
                            )}
                          >
                            <Check className="text-primary-foreground size-3" />
                          </div>
                          {opt.label}
                          <span className="relative flex size-2 ml-auto">
                            <span
                              className={cn(
                                "absolute inline-flex top-0 left-0 animate-ping size-full rounded-full opacity-75",
                                opt.value ? "bg-emerald-400" : "bg-red-400",
                              )}
                            />
                            <span
                              className={cn(
                                "relative inline-flex size-2 rounded-full",
                                opt.value ? "bg-emerald-500" : "bg-red-500",
                              )}
                            />
                          </span>
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                  {selectedStatus !== undefined && (
                    <>
                      <CommandSeparator />
                      <CommandGroup>
                        <CommandItem
                          className="text-xs font-medium justify-center"
                          onSelect={() => handleStatusChange(undefined)}
                        >
                          Clear filter
                        </CommandItem>
                      </CommandGroup>
                    </>
                  )}
                </Command>
              </PopoverContent>
            </Popover>

            {/* Filter Rating */}
            <Popover>
              <PopoverTrigger
                render={
                  <button className="flex items-center border border-gray-300 dark:border-gray-300/50 border-dashed rounded-md h-8 hover:bg-yellow-200 dark:hover:bg-yellow-300/30 transition cursor-default group">
                    <div className="text-xs font-medium h-full py-0 px-3 flex items-center gap-2">
                      <PlusCircle className="size-3" />
                      Penilaian
                    </div>
                    {appliedRating !== undefined && (
                      <>
                        <Separator
                          orientation="vertical"
                          className="data-[orientation=vertical]:h-full dark:bg-gray-500/50"
                        />
                        <div
                          className={cn(
                            "text-xs font-medium rounded-sm mx-2 px-2 py-0.5 flex items-center justify-center",
                            "bg-yellow-200 dark:bg-yellow-300/30 dark:group-hover:bg-transparent",
                          )}
                        >
                          {appliedRating} ★
                        </div>
                      </>
                    )}
                  </button>
                }
              />
              <PopoverContent
                portal={{ keepMounted: true }}
                className="p-0 w-36"
                align="start"
              >
                <Command className="p-0">
                  <CommandGroup>
                    {[5, 4, 3, 2, 1].map((r) => {
                      const isSelected = appliedRating === r;
                      return (
                        <CommandItem
                          key={r}
                          className="text-xs"
                          onSelect={() =>
                            handleRatingChange(isSelected ? undefined : r)
                          }
                        >
                          <div
                            className={cn(
                              "flex h-4 w-4 items-center justify-center rounded-sm border",
                              isSelected
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-gray-500/50 opacity-50 [&_svg]:invisible",
                            )}
                          >
                            <Check className="text-primary-foreground size-3" />
                          </div>
                          {r} ★
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                  {appliedRating !== undefined && (
                    <>
                      <CommandSeparator />
                      <CommandGroup>
                        <CommandItem
                          className="text-xs font-medium justify-center"
                          onSelect={() => handleRatingChange(undefined)}
                        >
                          Clear filter
                        </CommandItem>
                      </CommandGroup>
                    </>
                  )}
                </Command>
              </PopoverContent>
            </Popover>

            {hasActiveFilters && (
              <Button
                className="text-xs font-normal h-8 py-0 px-3"
                variant={"ghost"}
                onClick={handleResetFilters}
              >
                Reset
                <XCircle />
              </Button>
            )}
          </div>

          {/* Bulk actions */}
          {selectedIds.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {selectedIds.length} dipilih
              </span>
              <Button
                size={"sm"}
                className="text-xs h-8"
                onClick={handleBulkApprove}
              >
                <CheckCheck className="size-3.5" />
                Setujui Semua
              </Button>
            </div>
          )}
        </div>

        <DataTable
          columns={columns}
          data={reviews}
          isInitialLoading={isLoading}
        />
        <Pagination
          pagination={metaPage}
          setPage={handlePageChange}
          setLimit={handleLimitChange}
        />
      </div>
    </div>
  );
};
