import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { OrderItem } from "@/app/(main)/orders/_api/types";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { MoreHorizontal, ReceiptText, Trash2 } from "lucide-react";

const statusConfig: Record<string, { label: string; className: string }> = {
  PENDING: {
    label: "Menunggu",
    className:
      "bg-yellow-500/10 border-yellow-500/20 text-yellow-600 dark:text-yellow-400",
  },
  PROCESSING: {
    label: "Diproses",
    className:
      "bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400",
  },
  READY: {
    label: "Siap Kirim",
    className:
      "bg-purple-500/10 border-purple-500/20 text-purple-600 dark:text-purple-400",
  },
  SHIPPED: {
    label: "Dikirim",
    className:
      "bg-orange-500/10 border-orange-500/20 text-orange-600 dark:text-orange-400",
  },
  COMPLETED: {
    label: "Selesai",
    className:
      "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400",
  },
  CANCELLED: {
    label: "Dibatalkan",
    className: "bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400",
  },
};

type ColumnsProps = {
  onDetail?: (id: string) => void;
  onDelete?: (kode: string, id: string) => void;
};

export const createColumns = ({
  onDetail,
  onDelete,
}: ColumnsProps): ColumnDef<OrderItem>[] => [
  {
    id: "id",
    header: () => <div className="text-center">No</div>,
    cell: ({ row }) => (
      <div className="text-center tabular-nums">
        {(1 + row.index).toLocaleString()}
      </div>
    ),
  },
  {
    accessorKey: "kode",
    header: "No. Pesanan",
  },
  {
    accessorKey: "buyer",
    header: "Pembeli",
    cell: ({ row }) => row.original.buyer.nama,
  },
  {
    accessorKey: "order_at",
    header: "Tanggal",
    cell: ({ row }) =>
      row.original.order_at
        ? format(new Date(row.original.order_at), "MMM dd, yyyy 'at' HH:mm")
        : "-",
  },
  {
    accessorKey: "total_bayar",
    header: "Total",
    cell: ({ row }) =>
      Number(row.original.total_bayar).toLocaleString("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
      }),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const cfg = statusConfig[row.original.status] ?? {
        label: row.original.status,
        className: "",
      };
      return (
        <Badge className={`${cfg.className} capitalize`}>{cfg.label}</Badge>
      );
    },
  },
  {
    accessorKey: "payment_type",
    header: "Pembayaran",
    cell: ({ row }) => (
      <Badge className="bg-gray-500/10 dark:bg-gray-500/20 border-gray-500/20 text-gray-600 dark:text-gray-300 capitalize">
        {row.original.payment_type === "REGULAR"
          ? "Reguler"
          : row.original.payment_type}
      </Badge>
    ),
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger
          className={buttonVariants({ size: "icon-xs", variant: "ghost" })}
        >
          <MoreHorizontal />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuGroup>
            <DropdownMenuLabel>Aksi</DropdownMenuLabel>
            <DropdownMenuItem
              className="text-xs"
              onClick={() => {
                onDetail?.(row.original.id);
              }}
            >
              <ReceiptText className="size-3.5" />
              Detail
            </DropdownMenuItem>
            {row.original.status === "CANCELLED" && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-xs text-red-600 focus:text-red-600"
                  onClick={() => {
                    onDelete?.(row.original.kode, row.original.id);
                  }}
                >
                  <Trash2 className="size-3.5" />
                  Hapus
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];

// backward-compat: kolom tanpa aksi (untuk usage non-interaktif)
export const column: ColumnDef<OrderItem>[] = createColumns({});
