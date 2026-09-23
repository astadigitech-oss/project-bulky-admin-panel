"use client";

import Pagination from "@/components/pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import DataTable from "@/components/ui/data-table";
import { InputSearch } from "@/components/ui/input-search";
import { Empty, EmptyHeader, EmptyMedia } from "@/components/ui/empty";
import { usePagination } from "@/hooks/use-pagination";
import { useSearchQuery } from "@/hooks/use-search";
import { useGetAuctionBids } from "../../_api";
import { formatRupiah } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import { useQueryStates, parseAsString, parseAsStringLiteral } from "nuqs";
import React, { useEffect, useState } from "react";
import { Gift, RefreshCw } from "lucide-react";
import {
  AuctionBatchDetail,
  AuctionBidDetail,
  AuctionStatus,
} from "../../_api/types";
import { WinnerDialog } from "./winner-dialog";
import { OperationsCard } from "./operations-card";
import { TooltipText } from "@/providers/tooltip-provider";

export const BidTab = ({
  batch,
  canManage,
  onChanged,
}: {
  batch: AuctionBatchDetail;
  canManage: boolean;
  onChanged?: () => void;
}) => {
  const [{ sort, buyer_id }, setQuery] = useQueryStates({
    sort: parseAsStringLiteral([
      "created_at_desc",
      "amount_desc",
      "amount_asc",
    ] as const).withDefault("created_at_desc"),
    buyer_id: parseAsString.withDefault(""),
  });

  const { search, searchValue, setSearch } = useSearchQuery();
  const { page, limit, metaPage, setPage, setLimit, setPaginationData } =
    usePagination();

  const {
    data: list,
    refetch,
    isRefetching,
    isPending,
    isLoading: isLoadList,
  } = useGetAuctionBids(batch.id, {
    page,
    per_page: limit,
    search: searchValue,
    buyer_id: buyer_id || undefined,
    sort_by: sort,
  });

  const bids = list?.data ?? [];
  const [selectedBid, setSelectedBid] = useState<AuctionBidDetail | null>(null);
  const [isWinnerOpen, setIsWinnerOpen] = useState(false);

  useEffect(() => {
    if (list) {
      if (page > list.meta.last_page) {
        setPage(list.meta.last_page);
        return;
      }
      setPaginationData(list.meta);
    }
  }, [list]);

  const columns: ColumnDef<AuctionBidDetail>[] = [
    {
      id: "no",
      header: () => <div className="text-center">No</div>,
      cell: ({ row }) => (
        <div className="text-center tabular-nums">
          {(metaPage.from + row.index).toLocaleString()}
        </div>
      ),
    },
    {
      accessorKey: "buyer.nama",
      header: "Buyer",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.original.buyer.nama}</span>
          <span className="text-xs text-muted-foreground">
            {row.original.buyer.telepon}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "sequence",
      header: "Bid ke-",
      cell: ({ row }) => (
        <div className="tabular-nums">{row.original.sequence}</div>
      ),
    },
    {
      id: "bid_breakdown",
      header: "Rincian bid",
      cell: ({ row }) => (
        <div className="min-w-52 space-y-1.5 text-xs tabular-nums">
          <div className="flex items-baseline justify-between gap-4">
            <span className="text-muted-foreground">
              {row.original.input_mode === "PERCENT" && row.original.input_percent
                ? `Input persentase (${row.original.input_percent}%)`
                : "Input nominal"}
            </span>
            <span className="font-medium">{formatRupiah(row.original.amount)}</span>
          </div>
          <div className="flex items-baseline justify-between gap-4">
            <span className="text-muted-foreground">
              Ongkir {row.original.shipping_provider_snapshot ? `(${row.original.shipping_provider_snapshot})` : ""}
            </span>
            <span className="font-medium">
              {formatRupiah(row.original.shipping_amount_snapshot)}
            </span>
          </div>
          <div className="flex items-baseline justify-between gap-4">
            <span className="text-muted-foreground">PPN ({row.original.ppn_rate_snapshot}%)</span>
            <span className="font-medium">
              {formatRupiah(row.original.ppn_amount_snapshot)}
            </span>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "estimated_total_snapshot",
      header: "Total estimasi",
      cell: ({ row }) => (
        <div className="font-medium tabular-nums">
          {formatRupiah(row.original.estimated_total_snapshot)}
        </div>
      ),
    },
    {
      accessorKey: "note",
      header: "Catatan buyer",
      cell: ({ row }) => row.original.note ? (
        <p className="max-w-48 whitespace-normal text-xs leading-5">
          {row.original.note}
        </p>
      ) : <span className="text-muted-foreground">-</span>,
    },
    {
      accessorKey: "created_at",
      header: "Waktu",
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">
          {new Date(row.original.created_at).toLocaleString("id-ID")}
        </span>
      ),
    },
    {
      id: "selected",
      header: () => <div className="text-center">Pemenang</div>,
      cell: ({ row }) =>
        row.original.is_selected ? (
          <div className="text-center">
            <Badge variant="default">Terpilih</Badge>
          </div>
        ) : null,
    },
    {
      id: "actions",
      header: "Aksi",
      cell: ({ row }) =>
        canManage && batch.status === "OPEN" ? (
          <div className="flex">
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              disabled={isPending}
              onClick={() => {
                setSelectedBid(row.original);
                setIsWinnerOpen(true);
              }}
            >
              <Gift className="size-3.5" />
              Pilih Pemenang
            </Button>
          </div>
        ) : null,
    },
  ];

  return (
    <div className="flex flex-col gap-6 pt-2">
      <WinnerDialog
        open={isWinnerOpen}
        onOpenChange={setIsWinnerOpen}
        batch={batch}
        bid={selectedBid}
        onDone={onChanged}
      />

      {batch.status === "SOLD" && <OperationsCard batch={batch} onDone={onChanged} />}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <InputSearch
            placeholder="Cari nama atau telepon buyer..."
            classNameWrap="w-64"
            value={search}
            setValue={setSearch}
          />
          <select
            className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
            value={sort}
            onChange={(e) => setQuery({ sort: e.target.value as any })}
            disabled={isPending}
          >
            <option value="created_at_desc">Waktu Terbaru</option>
            <option value="amount_desc">Nominal Tertinggi</option>
            <option value="amount_asc">Nominal Terendah</option>
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
                  className={
                    "size-3.5 " + (isRefetching ? "animate-spin" : "")
                  }
                />
              </Button>
            }
          />
        </div>
      </div>

      {bids.length === 0 && !isLoadList ? (
        <Empty>
          <EmptyMedia variant="icon">
            <Gift className="size-4" />
          </EmptyMedia>
          <EmptyHeader>
            <p className="text-sm font-medium">Belum ada penawaran masuk</p>
            <p className="text-xs text-muted-foreground">
              Bid akan muncul setelah buyer memasukkan penawaran.
            </p>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="flex flex-col gap-4">
          <DataTable columns={columns} data={bids} isInitialLoading={isLoadList} />
          <Pagination
            pagination={{ ...metaPage, current_page: page, per_page: limit }}
            setPage={setPage}
            setLimit={setLimit}
          />
        </div>
      )}
    </div>
  );
};
