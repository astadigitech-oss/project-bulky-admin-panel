import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { TooltipText } from "@/providers/tooltip-provider";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import {
  Boxes,
  Clock,
  MoreHorizontal,
  Pencil,
  Ruler,
  Truck,
  Weight,
} from "lucide-react";
import { MetaPagination } from "@/lib/types";
import { Dispatch, SetStateAction } from "react";
import { DelivereeVehicle } from "../_api/types";

export const formatKubikasi = (value: number | null | undefined) =>
  value == null || isNaN(value)
    ? "-"
    : `${Number(value).toLocaleString("id-ID", {
        maximumFractionDigits: 3,
      })} m³`;

export const formatBerat = (value: number | null | undefined) =>
  value == null || isNaN(value)
    ? "-"
    : `${Number(value).toLocaleString("id-ID", {
        maximumFractionDigits: 2,
      })} kg`;

const EnvironmentBadge = ({ value }: { value: "sandbox" | "production" }) => (
  <Badge
    variant="outline"
    className={cn(
      "gap-1.5 border-transparent font-medium",
      value === "sandbox"
        ? "bg-amber-500/15 text-amber-600 dark:bg-amber-500/20 dark:text-amber-300"
        : "bg-blue-500/15 text-blue-600 dark:bg-blue-500/20 dark:text-blue-300",
    )}
  >
    <span
      className={cn(
        "size-1.5 rounded-full",
        value === "sandbox" ? "bg-amber-500" : "bg-blue-500",
      )}
    />
    {value === "sandbox" ? "Sandbox" : "Produksi"}
  </Badge>
);

export const column = ({
  metaPage,
  setQuery,
  setDialog,
  disabled,
}: {
  metaPage: MetaPagination;
  setQuery: any;
  setDialog: (mode: "detail" | "edit" | null) => void;
  disabled: boolean;
}): ColumnDef<DelivereeVehicle>[] => [
  {
    id: "id",
    header: () => <div className="text-center">No</div>,
    cell: ({ row }) => (
      <div className="text-center tabular-nums">
        {(metaPage.from + row.index).toLocaleString()}
      </div>
    ),
  },
  {
    accessorKey: "nama",
    header: "Nama Kendaraan",
    cell: ({ row }) => (
      <div className="flex flex-col gap-0.5">
        <span className="font-medium text-foreground">{row.original.nama}</span>
        <span className="text-[11px] text-muted-foreground flex items-center gap-1">
          <Ruler className="size-3" />
          {row.original.cargo_length != null &&
          row.original.cargo_width != null &&
          row.original.cargo_height != null
            ? `${row.original.cargo_length} × ${row.original.cargo_width} × ${row.original.cargo_height} cm`
            : "Dimensi tidak tersedia"}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "id_deliveree",
    header: "ID Deliveree",
    cell: ({ row }) => (
      <Badge variant="secondary" className="tabular-nums font-mono">
        {row.original.id_deliveree}
      </Badge>
    ),
  },
  {
    accessorKey: "environment",
    header: "Lingkungan",
    cell: ({ row }) => <EnvironmentBadge value={row.original.environment} />,
  },
  {
    accessorKey: "kubikasi_max",
    header: "Kubikasi Max",
    cell: ({ row }) => (
      <div className="flex items-center gap-1.5 tabular-nums">
        <Boxes className="size-3.5 text-muted-foreground" />
        {formatKubikasi(row.original.kubikasi_max)}
      </div>
    ),
  },
  {
    accessorKey: "berat_max",
    header: "Berat Max",
    cell: ({ row }) => (
      <div className="flex items-center gap-1.5 tabular-nums">
        <Weight className="size-3.5 text-muted-foreground" />
        {formatBerat(row.original.berat_max)}
      </div>
    ),
  },
  {
    id: "threshold",
    header: "Threshold",
    cell: ({ row }) => (
      <div className="flex flex-col gap-0.5 text-[11px] tabular-nums text-muted-foreground">
        <span>Kubikasi: {formatKubikasi(row.original.threshold_kubikasi)}</span>
        <span>Berat: {formatBerat(row.original.threshold_berat)}</span>
      </div>
    ),
  },
  {
    accessorKey: "is_active",
    header: "Status",
    cell: ({ row }) => (
      <div
        className={cn(
          "flex items-center gap-2 text-xs px-2 py-0.5 rounded-full font-medium w-fit",
          row.original.is_active
            ? "bg-green-500/20 dark:bg-green-500/30 dark:text-emerald-100 text-emerald-600"
            : "bg-red-500/10 dark:bg-red-500/30 dark:text-red-200 text-red-600",
        )}
      >
        <div
          className={cn(
            "size-2 rounded-full",
            row.original.is_active ? "bg-green-500" : "bg-red-500",
          )}
        />
        {row.original.is_active ? "Aktif" : "Nonaktif"}
      </div>
    ),
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <TooltipText
          value={
            <div className="flex flex-col gap-2">
              <div className="flex flex-col">
                <div className="text-xs">Terakhir disinkronkan:</div>
                <div className="text-xs font-semibold">
                  {row.original.last_synced_at
                    ? format(row.original.last_synced_at, "PPpp", {
                        locale: id,
                      })
                    : "Belum pernah"}
                </div>
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
            disabled={disabled}
            className={buttonVariants({ size: "icon-xs", variant: "ghost" })}
          >
            <MoreHorizontal />
            <span className="sr-only">toggle action</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuGroup>
              <DropdownMenuLabel>Aksi</DropdownMenuLabel>
              <DropdownMenuItem
                className={"text-xs"}
                onClick={() => {
                  setQuery({ id: row.original.id });
                  setDialog("detail");
                }}
              >
                <Truck className="size-3.5" />
                Detail
              </DropdownMenuItem>
              <DropdownMenuItem
                className={"text-xs"}
                onClick={() => {
                  setQuery({ id: row.original.id });
                  setDialog("edit");
                }}
              >
                <Pencil className="size-3.5" />
                Ubah
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),
  },
];
