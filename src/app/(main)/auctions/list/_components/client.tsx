"use client";

import Pagination from "@/components/pagination";
import { Button } from "@/components/ui/button";
import DataTable from "@/components/ui/data-table";
import { InputSearch } from "@/components/ui/input-search";
import { usePagination } from "@/hooks/use-pagination";
import { useSearchQuery } from "@/hooks/use-search";
import { useMe } from "@/components/container/_api";
import { useGetAuctionList } from "../../_api";
import { cn } from "@/lib/utils";
import { TooltipText } from "@/providers/tooltip-provider";
import { Plus, RefreshCw } from "lucide-react";
import Link from "next/link";
import { parseAsStringLiteral, useQueryStates } from "nuqs";
import React, { useEffect } from "react";
import { AuctionStatus } from "../../_api/types";
import { auctionColumns } from "./columns";

const statusOptions: { label: string; value: AuctionStatus | "all" }[] = [
  { label: "Semua Status", value: "all" },
  { label: "Draft", value: "DRAFT" },
  { label: "Buka", value: "OPEN" },
  { label: "Terjual", value: "SOLD" },
];

export const AuctionListClient = () => {
  const { data: meData } = useMe();
  const permissions = meData?.data?.permissions ?? [];
  const canManage = permissions.includes("auction:manage");

  const [{ status }, setQuery] = useQueryStates({
    status: parseAsStringLiteral([
      "all",
      "DRAFT",
      "OPEN",
      "SOLD",
    ] as const).withDefault("all"),
  });

  const { search, searchValue, setSearch } = useSearchQuery();
  const { page, limit, metaPage, setPage, setLimit, setPaginationData } =
    usePagination();

  // Backend memperlakukan status non-kosong sebagai filter; "all" tidak boleh
  // dikirim (jika dikirim, query memfilter status='all' dan hasilnya kosong).
  const statusParam = status === "all" ? undefined : (status as AuctionStatus);

  const {
    data: list,
    refetch,
    isRefetching,
    isPending,
    isLoading: isLoadList,
  } = useGetAuctionList({
    page,
    per_page: limit,
    search: searchValue,
    status: statusParam,
    sort_by: "created_at_desc",
  });

  const auctionList = list?.data ?? [];

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
      <div className="flex items-center justify-between">
        <h1 className="leading-none font-semibold text-2xl">Daftar Lelang</h1>
        <div className="flex items-center gap-2">
          <InputSearch
            placeholder="Cari nama atau kode..."
            classNameWrap="w-60"
            value={search}
            setValue={setSearch}
          />
          <select
            className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
            value={status}
            onChange={(e) =>
              setQuery({
                status: e.target.value as AuctionStatus | "all",
              })
            }
            disabled={isPending}
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <TooltipText
            value="Perbarui Data"
            render={
              <Button
                variant="outline"
                size="icon"
                disabled={isPending}
                onClick={() => refetch()}
              >
                <RefreshCw
                  className={cn("size-3.5", isRefetching && "animate-spin")}
                />
              </Button>
            }
          />
          {canManage && (
            <Link href="/auctions/create">
              <Button className="text-xs" disabled={isPending}>
                <Plus className="size-3.5" />
                Buat Batch
              </Button>
            </Link>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <DataTable
          columns={auctionColumns({ metaPage })}
          data={auctionList}
          isInitialLoading={isLoadList}
        />
        <Pagination
          pagination={{ ...metaPage, current_page: page, per_page: limit }}
          setPage={setPage}
          setLimit={setLimit}
        />
      </div>
    </div>
  );
};
