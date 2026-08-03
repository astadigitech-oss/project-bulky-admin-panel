import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Ratings from "@/components/ui/rating";
import { cn } from "@/lib/utils";
import { TooltipText } from "@/providers/tooltip-provider";
import { ReviewItem } from "../_api/types";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import {
  CheckCircle,
  Clock,
  MoreHorizontal,
  ReceiptText,
  Trash2,
  XCircle,
} from "lucide-react";

type ColumnsProps = {
  selectedIds: string[];
  allIds: string[];
  onToggleSelect: (reviewId: string) => void;
  onToggleAll: (ids: string[]) => void;
  onDetail: (reviewId: string) => void;
  onApprove: (reviewId: string) => void;
  onReject: (reviewId: string) => void;
  onDelete: (reviewId: string) => void;
};

export const createColumns = ({
  selectedIds,
  allIds,
  onToggleSelect,
  onToggleAll,
  onDetail,
  onApprove,
  onReject,
  onDelete,
}: ColumnsProps): ColumnDef<ReviewItem>[] => [
  {
    id: "select",
    header: () => (
      <Checkbox
        checked={allIds.length > 0 && selectedIds.length === allIds.length}
        onCheckedChange={() =>
          selectedIds.length === allIds.length
            ? onToggleAll([])
            : onToggleAll(allIds)
        }
        aria-label="Pilih semua"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={selectedIds.includes(row.original.id)}
        onCheckedChange={() => onToggleSelect(row.original.id)}
        aria-label="Pilih baris"
      />
    ),
    enableHiding: false,
  },
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
    accessorKey: "pesanan",
    header: "No. Pesanan",
    cell: ({ row }) => row.original.pesanan.kode,
  },
  {
    accessorKey: "buyer",
    header: "Pembeli",
    cell: ({ row }) => row.original.buyer.nama,
  },
  {
    accessorKey: "rating",
    header: "Penilaian",
    cell: ({ row }) => (
      <Ratings
        value={row.original.rating}
        iconSize={16}
        color="oklch(85.2% 0.199 91.936)"
        readOnly
      />
    ),
  },
  {
    id: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge
        className={cn(
          "capitalize cursor-default",
          row.original.approved.status
            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
            : "bg-red-500/5 border-red-500/20 text-red-600 dark:text-red-400",
        )}
      >
        {row.original.approved.status ? "Publik" : "Arsip"}
      </Badge>
    ),
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const isApproved = row.original.approved.status;
      return (
        <div className="flex items-center gap-2">
          <TooltipText
            value={
              <div className="flex flex-col">
                <div className="text-xs">Dibuat:</div>
                <div className="text-xs font-semibold">
                  {format(new Date(row.original.created_at), "PPP", {
                    locale: id,
                  })}
                </div>
              </div>
            }
            render={
              <Button variant={"ghost"} size={"icon-xs"}>
                <Clock />
              </Button>
            }
          />
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
                  onClick={() => onDetail(row.original.id)}
                >
                  <ReceiptText className="size-3.5" />
                  Detail
                </DropdownMenuItem>
                {!isApproved ? (
                  <DropdownMenuItem
                    className="text-xs text-emerald-600 focus:text-emerald-600"
                    onClick={() => onApprove(row.original.id)}
                  >
                    <CheckCircle className="size-3.5" />
                    Setujui
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem
                    className="text-xs text-orange-600 focus:text-orange-600"
                    onClick={() => onReject(row.original.id)}
                  >
                    <XCircle className="size-3.5" />
                    Tolak
                  </DropdownMenuItem>
                )}
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem
                  className="text-xs text-red-600 focus:text-red-600"
                  onClick={() => onDelete(row.original.id)}
                >
                  <Trash2 className="size-3.5" />
                  Hapus
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];
