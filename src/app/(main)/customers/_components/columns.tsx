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
import { MoreHorizontal, ReceiptText, Trash } from "lucide-react";
import { BuyerListResponse } from "../_api/types";
import Link from "next/link";
import { MetaPagination } from "@/lib/types";

export const column = ({
  handleDelete,
  metaPage,
  isDisabled,
}: {
  handleDelete: (id: string, userId: string) => Promise<void>;
  metaPage: MetaPagination;
  isDisabled: boolean;
}): ColumnDef<BuyerListResponse["data"][number]>[] => [
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
    accessorKey: "username",
    header: "Username",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "telepon",
    header: "No. Telepon",
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger
          disabled={isDisabled}
          className={buttonVariants({ size: "icon-xs", variant: "ghost" })}
        >
          <MoreHorizontal />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuGroup>
            <DropdownMenuLabel>Aksi</DropdownMenuLabel>
            <DropdownMenuItem
              className={"text-xs"}
              render={
                <Link href={`/customers/${row.original.id}`}>
                  <ReceiptText className="size-3.5" />
                  Detail
                </Link>
              }
            />
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
    ),
  },
];
