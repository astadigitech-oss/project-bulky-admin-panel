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
import { CircleDot, Clock, Edit, MoreHorizontal } from "lucide-react";
import { MetaPagination } from "@/lib/types";
import { VariantProps } from "class-variance-authority";
import { DisclaimerType } from "../_api/types";
import GB from "country-flag-icons/react/3x2/GB";
import ID from "country-flag-icons/react/3x2/ID";
import Link from "next/link";

export const column = ({
  metaPage,
  handleChangeStatus,
  disabled,
}: {
  metaPage: MetaPagination;
  disabled: boolean;
  handleChangeStatus: (
    command: string,
    userId: string,
    variant: VariantProps<typeof buttonVariants>["variant"],
  ) => Promise<void>;
}): ColumnDef<DisclaimerType>[] => [
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
    accessorKey: "judul.id",
    header: () => (
      <div className="flex items-center gap-2">
        Judul <ID className="h-3 aspect-3/2 rounded shadow" />
      </div>
    ),
  },
  {
    accessorKey: "judul.en",
    header: () => (
      <div className="flex items-center gap-2">
        Judul <GB className="h-3 aspect-3/2 rounded shadow" />
      </div>
    ),
  },
  {
    accessorKey: "isActive",
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
                <div className="text-xs">Di update:</div>
                <div className="text-xs font-semibold">
                  {format(row.original.updated_at, "PPpp", { locale: id })}
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
          <DropdownMenuContent className={"w-auto"}>
            <DropdownMenuGroup>
              <DropdownMenuLabel>Aksi</DropdownMenuLabel>
              <DropdownMenuItem
                disabled={row.original.is_active}
                className={"text-xs"}
                onClick={() =>
                  handleChangeStatus(
                    `Aktifkan ${row.original.judul.id}`,
                    row.original.id,
                    "default",
                  )
                }
              >
                <CircleDot className="size-3.5" />
                Aktifkan
              </DropdownMenuItem>
              <Link href={`/policies/disclaimer/${row.original.id}`}>
                <DropdownMenuItem className={"text-xs"}>
                  <Edit className="size-3.5" />
                  Edit
                </DropdownMenuItem>
              </Link>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),
  },
];
