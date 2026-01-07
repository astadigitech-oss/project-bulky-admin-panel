import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ColumnDef } from "@tanstack/react-table";
import { Circle, CircleDot, MoreHorizontal, ReceiptText } from "lucide-react";

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
    accessorKey: "name",
    header: "Nama",
  },
  {
    accessorKey: "username",
    header: "Username",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => (
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
              {row.original.isActive ? (
                <Circle className="size-3.5" />
              ) : (
                <CircleDot className="size-3.5" />
              )}
              {row.original.isActive ? "Nonaktifkan" : "Aktifkan"}
            </DropdownMenuItem>
            <DropdownMenuItem className={"text-xs"}>
              <ReceiptText className="size-3.5" />
              Detail
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];
