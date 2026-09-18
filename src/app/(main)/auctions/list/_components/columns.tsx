"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TooltipText } from "@/providers/tooltip-provider";
import { ColumnDef } from "@tanstack/react-table";
import { Eye, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { formatImageAlt, formatRupiah, sizesImage } from "@/lib/utils";
import { MetaPagination } from "@/lib/types";
import { AuctionBatchSummary, AuctionStatus } from "../../_api/types";

export const auctionStatusVariant: Record<
  AuctionStatus,
  { label: string; variant: "default" | "secondary" | "outline" | "destructive" }
> = {
  DRAFT: { label: "Draft", variant: "secondary" },
  OPEN: { label: "Buka", variant: "default" },
  SOLD: { label: "Terjual", variant: "destructive" },
};

export const auctionColumns = ({
  metaPage,
  onDelete,
  canManage,
  disabled,
}: {
  metaPage: MetaPagination;
  onDelete: (batch: AuctionBatchSummary) => void;
  canManage: boolean;
  disabled: boolean;
}): ColumnDef<AuctionBatchSummary>[] => [
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
    accessorKey: "code",
    header: "Kode",
    cell: ({ row }) => (
      <span className="font-mono text-xs">{row.original.code}</span>
    ),
  },
  {
    accessorKey: "nama_id",
    header: "Nama Batch",
    cell: ({ row }) => {
      const b = row.original;
      return (
        <div className="flex items-center gap-3">
          <div className="relative size-12 shrink-0 overflow-hidden rounded-md border bg-muted">
            {b.thumbnail_url ? (
              <Image
                src={b.thumbnail_url}
                alt={formatImageAlt(b.nama_id)}
                fill
                sizes={sizesImage}
                className="object-cover"
              />
            ) : (
              <div className="flex size-full flex-col items-center justify-center px-1 text-center text-[9px] leading-tight text-muted-foreground">
                Tidak ada gambar
              </div>
            )}
          </div>
          <div className="flex min-w-0 flex-col">
            <span className="truncate font-medium">{b.nama_id}</span>
            <span className="truncate text-xs text-muted-foreground">
              {b.code}
            </span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const s = auctionStatusVariant[row.original.status];
      return (
        <Badge variant={s.variant} className="capitalize">
          {s.label}
        </Badge>
      );
    },
  },
  {
    accessorKey: "bidder_count",
    header: "Bidder",
    cell: ({ row }) => (
      <div className="tabular-nums">{row.original.bidder_count}</div>
    ),
  },
  {
    accessorKey: "bid_count",
    header: "Bid",
    cell: ({ row }) => (
      <div className="tabular-nums">{row.original.bid_count}</div>
    ),
  },
  {
    accessorKey: "grand_total",
    header: "Grand Total",
    cell: ({ row }) => (
      <div className="tabular-nums">{formatRupiah(row.original.grand_total)}</div>
    ),
  },
  {
    accessorKey: "highest_bid",
    header: "Bid Tertinggi",
    cell: ({ row }) =>
      row.original.highest_bid ? (
        <div className="tabular-nums">{formatRupiah(row.original.highest_bid)}</div>
      ) : (
        <span className="text-muted-foreground">-</span>
      ),
  },
  {
    id: "actions",
    header: "Aksi",
    cell: ({ row }) => (
      <div className="flex gap-2">
        <TooltipText
          value="Lihat Detail"
          render={
            <Link href={`/auctions/${row.original.id}`}>
              <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                <Eye className="size-3.5" />
                Lihat
              </Button>
            </Link>
          }
        />
        {canManage && row.original.status === "DRAFT" && (
          <TooltipText
            value="Hapus draft"
            render={
              <Button
                variant="destructive"
                size="sm"
                className="gap-1.5 text-xs"
                disabled={disabled}
                onClick={() => onDelete(row.original)}
              >
                <Trash2 className="size-3.5" />
                Hapus
              </Button>
            }
          />
        )}
      </div>
    ),
  },
];
