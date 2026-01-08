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
import {
  Circle,
  CircleDot,
  Clock,
  Edit,
  MoreHorizontal,
  ShieldUser,
  Trash,
} from "lucide-react";
import { StaffListResponse } from "../_api/data";
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
  setOpen: Dispatch<SetStateAction<"edit" | "create" | "password" | null>>;
  metaPage: MetaPagination;
  setQuery: any;
  disabled: boolean;
  handleDelete: (user: string, userId: string) => Promise<void>;
  handleChangeStatus: (
    command: string,
    userId: string,
    variant: VariantProps<typeof buttonVariants>["variant"],
  ) => Promise<void>;
}): ColumnDef<StaffListResponse["data"][number]>[] => [
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
    header: "Nama",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "role.nama",
    header: "Role",
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
                <div className="text-xs">Dibuat:</div>
                <div className="text-xs font-semibold">
                  {format(row.original.created_at, "PPpp", { locale: id })}
                </div>
              </div>
              {row.original.last_login_at && (
                <div className="flex flex-col">
                  <div className="text-xs">Terakhir Login:</div>
                  <div className="text-xs font-semibold">
                    {format(row.original.last_login_at, "PPpp", {
                      locale: id,
                    })}
                  </div>
                </div>
              )}
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
                onClick={() =>
                  handleChangeStatus(
                    row.original.is_active
                      ? `Nonaktifkan ${row.original.nama}`
                      : `Aktifkan ${row.original.nama}`,
                    row.original.id,
                    row.original.is_active ? "destructive" : "default",
                  )
                }
              >
                {row.original.is_active ? (
                  <Circle className="size-3.5" />
                ) : (
                  <CircleDot className="size-3.5" />
                )}
                {row.original.is_active ? "Nonaktifkan" : "Aktifkan"}
              </DropdownMenuItem>
              <DropdownMenuItem
                className={"text-xs"}
                onClick={() => {
                  setOpen("edit");
                  setQuery({ adminId: row.original.id });
                }}
              >
                <Edit className="size-3.5" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                className={"text-xs"}
                onClick={() => {
                  setOpen("password");
                  setQuery({ adminId: row.original.id });
                }}
              >
                <ShieldUser className="size-3.5" />
                Ganti Password
              </DropdownMenuItem>
              <DropdownMenuItem
                className={"text-xs"}
                onClick={() => handleDelete(row.original.nama, row.original.id)}
                variant="destructive"
              >
                <Trash className="size-3.5" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),
  },
];
