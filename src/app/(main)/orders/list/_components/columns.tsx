import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { MoreHorizontal, ReceiptText } from "lucide-react";

export const column: ColumnDef<any>[] = [
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
    accessorKey: "orderId",
    header: "No. Pesanan",
  },
  {
    accessorKey: "name",
    header: "Pengguna",
  },
  {
    accessorKey: "date",
    header: "Tanggal",
    cell: ({ row }) => format(row.original.date, "MMM dd, yyyy 'at' HH:mm"),
  },
  {
    accessorKey: "total",
    header: "Total",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge className="bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
        {row.original.status}
      </Badge>
    ),
  },
  {
    id: "actions",
    enableHiding: false,
    cell: () => (
      <DropdownMenu>
        <DropdownMenuTrigger
          className={buttonVariants({ size: "icon-xs", variant: "ghost" })}
        >
          <MoreHorizontal />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuGroup>
            <DropdownMenuLabel>Aksi</DropdownMenuLabel>
            <DropdownMenuItem className={"text-xs"}>
              <ReceiptText className="size-3.5" />
              Detail
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];
