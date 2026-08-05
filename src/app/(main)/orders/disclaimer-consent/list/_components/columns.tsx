import { buttonVariants } from "@/components/ui/button";
import { DisclaimerConsentItem } from "@/app/(main)/orders/disclaimer-consent/_api/types";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { ReceiptText } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type ColumnsProps = {
  onDetail?: (pesananId: string) => void;
};

export const createColumns = ({
  onDetail,
}: ColumnsProps): ColumnDef<DisclaimerConsentItem>[] => [
  {
    id: "no",
    header: () => <div className="text-center">No</div>,
    cell: ({ row }) => (
      <div className="text-center tabular-nums">
        {(1 + row.index).toLocaleString()}
      </div>
    ),
  },
  {
    accessorKey: "pesanan_kode",
    header: "No. Pesanan",
  },
  {
    accessorKey: "buyer_nama",
    header: "Nama Pembeli",
  },
  {
    accessorKey: "buyer_email",
    header: "Email Pembeli",
    cell: ({ row }) => row.original.buyer_email || <span className="text-muted-foreground italic">—</span>,
  },
  {
    accessorKey: "disetujui_at",
    header: "Disetujui Pada",
    cell: ({ row }) =>
      row.original.disetujui_at
        ? format(new Date(row.original.disetujui_at), "MMM dd, yyyy 'at' HH:mm")
        : "-",
  },
  {
    accessorKey: "ip_address",
    header: "IP Address",
    cell: ({ row }) =>
      row.original.ip_address ?? (
        <span className="text-muted-foreground italic">—</span>
      ),
  },
  {
    id: "actions",
    header: () => <div className="text-center">Aksi</div>,
    cell: ({ row }) => (
      <div className="flex justify-center">
        <Link
          href={`/orders/disclaimer-consent/list/${row.original.pesanan_id}`}
          onClick={() => onDetail?.(row.original.pesanan_id)}
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "gap-1.5",
          )}
        >
          <ReceiptText className="size-3.5" />
          Detail
        </Link>
      </div>
    ),
  },
];
