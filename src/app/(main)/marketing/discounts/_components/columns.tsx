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
import { format } from "date-fns";
import { id } from "date-fns/locale";
import {
  Circle,
  CircleDot,
  Clock,
  Edit,
  Eye,
  MoreHorizontal,
  Trash,
} from "lucide-react";
import { MetaPagination } from "@/lib/types";
import { Dispatch, SetStateAction } from "react";
import { VariantProps } from "class-variance-authority";
import { CouponType } from "../_api/types";
import { Badge } from "@/components/ui/badge";

export const column = ({
  setOpen,
  setUsageCouponId,
  metaPage,
  setQuery,
  handleDelete,
  handleToggleStatus,
  disabled,
}: {
  setOpen: Dispatch<SetStateAction<"edit" | "create" | null>>;
  setUsageCouponId: Dispatch<SetStateAction<string | null>>;
  metaPage: MetaPagination;
  setQuery: any;
  disabled: boolean;
  handleDelete: (name: string, id: string) => Promise<void>;
  handleToggleStatus: (
    command: string,
    id: string,
    variant: VariantProps<typeof buttonVariants>["variant"],
  ) => Promise<void>;
}): ColumnDef<CouponType>[] => [
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
    accessorKey: "kode",
    header: "Kode",
  },
  {
    accessorKey: "nama",
    header: "Nama",
    cell: ({ row }) => row.original.nama || "-",
  },
  {
    accessorKey: "jenis_diskon",
    header: "Jenis",
    cell: ({ row }) => (
      <Badge variant="outline" className="capitalize">
        {row.original.jenis_diskon.replace("_", " ")}
      </Badge>
    ),
  },
  {
    accessorKey: "nilai_diskon",
    header: "Nilai",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <div className="text-xs">
        <Badge variant={row.original.status ? "default" : "secondary"}>
          {row.original.status ? "Aktif" : "Nonaktif"}
        </Badge>
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
          <DropdownMenuContent>
            <DropdownMenuGroup>
              <DropdownMenuLabel>Aksi</DropdownMenuLabel>
              <DropdownMenuItem
                className={"text-xs"}
                onClick={() =>
                  handleToggleStatus(
                    row.original.status
                      ? `Nonaktifkan ${row.original.kode}`
                      : `Aktifkan ${row.original.kode}`,
                    row.original.id,
                    row.original.status ? "destructive" : "default",
                  )
                }
              >
                {row.original.status ? (
                  <Circle className="size-3.5" />
                ) : (
                  <CircleDot className="size-3.5" />
                )}
                {row.original.status ? "Nonaktifkan" : "Aktifkan"}
              </DropdownMenuItem>
              <DropdownMenuItem
                className={"text-xs"}
                onClick={() => {
                  setUsageCouponId(row.original.id);
                }}
              >
                <Eye className="size-3.5" />
                Lihat Usages
              </DropdownMenuItem>
              <DropdownMenuItem
                className={"text-xs"}
                onClick={() => {
                  setOpen("edit");
                  setQuery({ couponId: row.original.id });
                }}
              >
                <Edit className="size-3.5" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                className={"text-xs"}
                onClick={() => handleDelete(row.original.kode, row.original.id)}
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
