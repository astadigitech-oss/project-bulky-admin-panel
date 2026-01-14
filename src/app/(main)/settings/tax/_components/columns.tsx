import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { TooltipText } from "@/providers/tooltip-provider";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { CircleDot, Clock, Edit, MoreHorizontal, Trash } from "lucide-react";
import { TaxListResponse } from "../_api/data";
import { MetaPagination } from "@/lib/types";
import { Dispatch, SetStateAction } from "react";
import { VariantProps } from "class-variance-authority";

export const column = ({
  setOpen,
  metaPage,
  setQuery,
  handleDelete,
  handleChangeStatus,
  disabled,
}: {
  setOpen: Dispatch<SetStateAction<"edit" | "create" | null>>;
  metaPage: MetaPagination;
  setQuery: any;
  disabled: boolean;
  handleDelete: (user: string, userId: string) => Promise<void>;
  handleChangeStatus: (
    command: string,
    userId: string,
    variant: VariantProps<typeof buttonVariants>["variant"],
  ) => Promise<void>;
}): ColumnDef<TaxListResponse["data"][number]>[] => [
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
    accessorKey: "persentase",
    header: "Persentase",
    cell: ({ row }) => `${row.original.persentase}%`,
  },
  {
    accessorKey: "is_active",
    header: "Status",
    cell: ({ row }) => (
      <div
        className={cn(
          "flex items-center gap-2 text-xs bg-green-500/20 px-2 py-0.5 rounded-full font-medium w-fit",
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
        {row.original.is_active ? "Aktif" : "Tidak Aktif"}
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
                <div className="text-xs">Diperbarui:</div>
                <div className="text-xs font-semibold">
                  {format(row.original.created_at, "PPpp", { locale: id })}
                </div>
              </div>
              <div className="flex flex-col">
                <div className="text-xs">Dibuat:</div>
                <div className="text-xs font-semibold">
                  {format(row.original.created_at, "PPpp", { locale: id })}
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
                disabled={row.original.is_active}
                onClick={() =>
                  handleChangeStatus(
                    `Aktifkan ${row.original.persentase}%`,
                    row.original.id,
                    "default",
                  )
                }
              >
                <CircleDot className="size-3.5" />
                Aktifkan
              </DropdownMenuItem>
              <DropdownMenuItem
                className={"text-xs"}
                onClick={() => {
                  setOpen("edit");
                  setQuery({ taxId: row.original.id });
                }}
              >
                <Edit className="size-3.5" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                className={"text-xs"}
                onClick={() =>
                  handleDelete(`${row.original.persentase}%`, row.original.id)
                }
                variant="destructive"
              >
                <Trash className="size-3.5" />
                Hapus
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),
  },
];
