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
import { TooltipText } from "@/providers/tooltip-provider";
import { ColumnDef } from "@tanstack/react-table";
import { BlogType } from "../_api/types";

import { VariantProps } from "class-variance-authority";
import { buttonVariants as buttonVariantsDef } from "@/components/ui/button";
import {
  Circle,
  CircleDot,
  Clock,
  Edit,
  MoreHorizontal,
  Trash,
} from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { MetaPagination } from "@/lib/types";

export const column = ({
  metaPage,
  disabled,
  handleEdit,
  handleDelete,
  handleChangeStatus,
}: {
  metaPage: MetaPagination;
  disabled: boolean;
  handleEdit: (id: string) => void;
  handleDelete: (title: string, id: string) => Promise<void>;
  handleChangeStatus: (
    command: string,
    id: string,
    variant: VariantProps<typeof buttonVariantsDef>["variant"],
  ) => Promise<void>;
}): ColumnDef<BlogType>[] => [
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
    accessorKey: "judul_id",
    header: "Judul (ID)",
  },
  {
    accessorKey: "judul_en",
    header: "Judul (EN)",
  },
  {
    accessorKey: "kategori.nama_id",
    header: "Kategori",
  },
  {
    accessorKey: "view_count",
    header: "Views",
    cell: ({ row }) =>
      Number(row.original.view_count ?? 0).toLocaleString("id-ID"),
  },
  {
    accessorKey: "is_active",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={row.original.is_active ? "default" : "secondary"}>
        {row.original.is_active ? "Aktif" : "Nonaktif"}
      </Badge>
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
                className={"text-xs"}
                onClick={() =>
                  handleChangeStatus(
                    row.original.is_active
                      ? `Nonaktifkan ${row.original.judul_id}`
                      : `Aktifkan ${row.original.judul_id}`,
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
                onClick={() => handleEdit(row.original.id)}
              >
                <Edit className="size-3.5" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                className={"text-xs"}
                onClick={() =>
                  handleDelete(row.original.judul_id, row.original.id)
                }
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
