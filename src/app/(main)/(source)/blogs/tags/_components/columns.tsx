import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { TooltipText } from "@/providers/tooltip-provider";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import {
  ArrowDown,
  ArrowUp,
  Clock,
  Edit,
  MoreHorizontal,
  Trash,
} from "lucide-react";
import { MetaPagination } from "@/lib/types";
import { Dispatch, SetStateAction } from "react";

const getLangText = (row: Record<string, unknown>, lang: "id" | "en") => {
  const flatKey = lang === "id" ? "nama_id" : "nama_en";
  const flatVal = row[flatKey];
  if (typeof flatVal === "string" && flatVal.length > 0) return flatVal;

  const nama = row.nama;
  if (typeof nama === "string") return nama;
  if (nama && typeof nama === "object") {
    const val = (nama as Record<string, unknown>)[lang];
    if (typeof val === "string") return val;
  }
  return "-";
};

import GB from "country-flag-icons/react/3x2/GB";
import ID from "country-flag-icons/react/3x2/ID";

export const column = ({
  setOpen,
  metaPage,
  setQuery,
  handleDelete,
  disabled,
  handleReorder,
}: {
  setOpen: Dispatch<SetStateAction<"edit" | "create" | null>>;
  metaPage: MetaPagination;
  setQuery: any;
  disabled: boolean;
  handleReorder: (id: string, direction: "up" | "down") => void;
  handleDelete: (user: string, userId: string) => Promise<void>;
}): ColumnDef<any>[] => [
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
    id: "nama_id",
    header: () => (
      <div className="flex items-center gap-2">
        Nama <ID className="h-3 aspect-3/2 rounded shadow" />
      </div>
    ),
    cell: ({ row }) =>
      getLangText(row.original as Record<string, unknown>, "id"),
  },
  {
    id: "nama_en",
    header: () => (
      <div className="flex items-center gap-2">
        Nama <GB className="h-3 aspect-3/2 rounded shadow" />
      </div>
    ),
    cell: ({ row }) =>
      getLangText(row.original as Record<string, unknown>, "en"),
  },
  {
    accessorKey: "urutan",
    header: "Urutan",
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
                className={"text-xs"}
                disabled={row.original.urutan === 1}
                onClick={() => handleReorder(row.original.id, "up")}
              >
                <ArrowUp className="size-3.5" />
                Naikan Urutan
              </DropdownMenuItem>
              <DropdownMenuItem
                className={"text-xs"}
                onClick={() => handleReorder(row.original.id, "down")}
              >
                <ArrowDown className="size-3.5" />
                Turunkan Urutan
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className={"text-xs"}
                onClick={() => {
                  setOpen("edit");
                  setQuery({ tagBlogId: row.original.id });
                }}
              >
                <Edit className="size-3.5" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                className={"text-xs"}
                onClick={() =>
                  handleDelete(
                    getLangText(row.original as Record<string, unknown>, "id"),
                    row.original.id,
                  )
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
