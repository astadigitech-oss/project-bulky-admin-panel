import { Button } from "@/components/ui/button";
import { TooltipText } from "@/providers/tooltip-provider";
import { MetaPagination } from "@/lib/types";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Clock, Eye } from "lucide-react";
import Link from "next/link";
import { ActivityLogType } from "../_api/types";

export const column = ({
  metaPage,
}: {
  metaPage: MetaPagination;
}): ColumnDef<ActivityLogType>[] => [
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
    accessorKey: "action",
    header: "Action",
  },
  {
    accessorKey: "modul",
    header: "Modul",
  },
  {
    accessorKey: "deskripsi",
    header: "Deskripsi",
  },
  {
    accessorKey: "ip_address",
    header: "IP Address",
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <TooltipText
          value={format(row.original.created_at, "PPpp", { locale: id })}
          render={
            <Button variant={"ghost"} size={"icon-xs"}>
              <Clock className="size-3.5" />
            </Button>
          }
        />
        <Link href={`/settings/activity-logs/${row.original.id}`}>
          <Button variant={"ghost"} size={"icon-xs"}>
            <Eye className="size-3.5" />
          </Button>
        </Link>
      </div>
    ),
  },
];
