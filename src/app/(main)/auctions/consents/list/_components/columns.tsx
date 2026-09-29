import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { ReceiptText } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn, formatRupiah } from "@/lib/utils";
import { PersetujuanSyaratLelangItem } from "@/app/(main)/auctions/consents/_api/types";

export const createColumns = ({ onDetail }: { onDetail?: (id: string) => void }): ColumnDef<PersetujuanSyaratLelangItem>[] => [
  {
    id: "no",
    header: () => <div className="text-center">No</div>,
    cell: ({ row }) => <div className="text-center tabular-nums">{row.index + 1}</div>,
  },
  { accessorKey: "batch_kode", header: "Kode Batch" },
  { accessorKey: "batch_nama", header: "Nama Batch" },
  { accessorKey: "buyer_nama", header: "Nama Pembeli" },
  { accessorKey: "bid_sequence", header: "Bid ke-", cell: ({ row }) => row.original.bid_sequence },
  { accessorKey: "bid_amount", header: "Nominal Bid", cell: ({ row }) => formatRupiah(row.original.bid_amount) },
  {
    accessorKey: "disetujui_at",
    header: "Disetujui Pada",
    cell: ({ row }) => format(new Date(row.original.disetujui_at), "dd MMM yyyy, HH:mm 'WIB'"),
  },
  { accessorKey: "ip_address", header: "IP Address", cell: ({ row }) => row.original.ip_address || "—" },
  {
    id: "actions",
    header: () => <div className="text-center">Aksi</div>,
    cell: ({ row }) => (
      <div className="flex justify-center">
        <Link
          href={`/auctions/consents/list/${row.original.id}`}
          onClick={() => onDetail?.(row.original.id)}
          className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1.5")}
        >
          <ReceiptText className="size-3.5" />
          Detail
        </Link>
      </div>
    ),
  },
];
