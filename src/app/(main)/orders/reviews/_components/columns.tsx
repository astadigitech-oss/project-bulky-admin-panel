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
import Ratings from "@/components/ui/rating";
import { cn } from "@/lib/utils";
import { TooltipText } from "@/providers/tooltip-provider";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import {
  Circle,
  CircleDot,
  Clock,
  MoreHorizontal,
  ReceiptText,
} from "lucide-react";

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
    accessorKey: "title",
    header: "Judul",
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
    accessorKey: "name",
    header: "Pengguna",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge
        className={cn(
          "capitalize cursor-default",
          row.original.status === "publik"
            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
            : "bg-red-500/5 border-red-500/20 text-red-600 dark:text-red-400",
        )}
      >
        {row.original.status}
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
            <div className="flex flex-col">
              <div className="text-xs">Dibuat:</div>
              <div className="text-xs font-semibold">
                {format(row.original.createdAt, "PPP", { locale: id })}
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
              <DropdownMenuItem className={"text-xs"}>
                {row.original.status === "publik" ? (
                  <Circle className="size-3.5" />
                ) : (
                  <CircleDot className="size-3.5" />
                )}
                {row.original.status === "publik" ? "Arsipkan" : "Publikasikan"}
              </DropdownMenuItem>
              <DropdownMenuItem className={"text-xs"}>
                <ReceiptText className="size-3.5" />
                Detail
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),
  },
];
