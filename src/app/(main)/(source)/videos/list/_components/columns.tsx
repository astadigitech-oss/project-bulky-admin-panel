import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TooltipText } from "@/providers/tooltip-provider";
import { ColumnDef } from "@tanstack/react-table";
import { VariantProps } from "class-variance-authority";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Circle, CircleDot, Clock, Edit, MoreHorizontal, Trash } from "lucide-react";
import { MetaPagination } from "@/lib/types";
import { VideoType } from "../_api/types";

export const column = ({
  metaPage,
  setOpen,
  setQuery,
  handleDelete,
  handleChangeStatus,
  disabled,
}: {
  metaPage: MetaPagination;
  setOpen: (state: "edit" | "create" | null) => void;
  setQuery: any;
  disabled: boolean;
  handleDelete: (title: string, id: string) => Promise<void>;
  handleChangeStatus: (
    command: string,
    id: string,
    variant: VariantProps<typeof buttonVariants>["variant"],
  ) => Promise<void>;
}): ColumnDef<VideoType>[] => [
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
    cell: ({ row }) => Number(row.original.view_count ?? 0).toLocaleString("id-ID"),
  },
  {
    accessorKey: "transcode_status",
    header: "Status Konversi",
    cell: ({ row }) => {
      const status = row.original.transcode_status;
      return status ? <Badge variant="outline">{status}</Badge> : <span className="text-muted-foreground">-</span>;
    },
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
    accessorKey: "published_at",
    header: "Published",
    cell: ({ row }) =>
      row.original.published_at
        ? format(row.original.published_at, "PP", { locale: id })
        : "-",
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
                onClick={() => {
                  setOpen("edit");
                  setQuery({ videoId: row.original.id });
                }}
              >
                <Edit className="size-3.5" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                className={"text-xs"}
                onClick={() => handleDelete(row.original.judul_id, row.original.id)}
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
