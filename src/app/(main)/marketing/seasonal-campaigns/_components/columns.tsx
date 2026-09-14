"use client";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MetaPagination } from "@/lib/types";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { id as localeID } from "date-fns/locale";
import { CalendarClock, Edit, MoreHorizontal, Rocket, Trash, XCircle } from "lucide-react";
import { SeasonalCampaign, SeasonalCampaignStatus } from "../_api/types";

const statusLabel: Record<SeasonalCampaignStatus, string> = {
  draft: "Draft",
  scheduled: "Terjadwal",
  active: "Aktif",
  ended: "Berakhir",
  cancelled: "Dibatalkan",
};
const statusVariant: Record<SeasonalCampaignStatus, "secondary" | "default" | "outline" | "destructive"> = {
  draft: "secondary",
  scheduled: "outline",
  active: "default",
  ended: "outline",
  cancelled: "destructive",
};

export const column = ({
  metaPage,
  onEdit,
  onDelete,
  onPublish,
  onCancel,
  disabled,
}: {
  metaPage: MetaPagination;
  onEdit: (campaign: SeasonalCampaign) => void;
  onDelete: (campaign: SeasonalCampaign) => Promise<void>;
  onPublish: (campaign: SeasonalCampaign) => Promise<void>;
  onCancel: (campaign: SeasonalCampaign) => Promise<void>;
  disabled: boolean;
}): ColumnDef<SeasonalCampaign>[] => [
  {
    id: "no",
    header: () => <div className="text-center">No</div>,
    cell: ({ row }) => <div className="text-center tabular-nums">{(metaPage.from + row.index).toLocaleString()}</div>,
  },
  { accessorKey: "nama", header: "Nama" },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <Badge variant={statusVariant[row.original.status]}>{statusLabel[row.original.status]}</Badge>,
  },
  {
    id: "periode",
    header: "Periode",
    cell: ({ row }) => row.original.tanggal_mulai && row.original.tanggal_selesai ? (
      <div className="flex items-center gap-1.5 text-xs whitespace-nowrap">
        <CalendarClock className="size-3.5 text-muted-foreground" />
        {format(new Date(row.original.tanggal_mulai), "d MMM yy", { locale: localeID })} – {format(new Date(row.original.tanggal_selesai), "d MMM yy", { locale: localeID })}
      </div>
    ) : <span className="text-muted-foreground">Belum diatur</span>,
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const campaign = row.original;
      const canPublish = campaign.status === "draft" || campaign.status === "cancelled";
      const canCancel = ["scheduled", "active", "ended"].includes(campaign.status);
      return (
        <DropdownMenu>
          <DropdownMenuTrigger disabled={disabled} className={buttonVariants({ size: "icon-xs", variant: "ghost" })}>
            <MoreHorizontal /><span className="sr-only">Aksi campaign</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-auto min-w-40">
            <DropdownMenuGroup>
              <DropdownMenuLabel>Aksi</DropdownMenuLabel>
              {canPublish && <DropdownMenuItem className="text-xs" onClick={() => onPublish(campaign)}><Rocket className="size-3.5" />Publish</DropdownMenuItem>}
              {canCancel && <DropdownMenuItem className="whitespace-nowrap text-xs" onClick={() => onCancel(campaign)} variant="destructive"><XCircle className="size-3.5" />Hentikan campaign</DropdownMenuItem>}
              <DropdownMenuItem className="text-xs" onClick={() => onEdit(campaign)}><Edit className="size-3.5" />Edit</DropdownMenuItem>
              <DropdownMenuItem className="text-xs" onClick={() => onDelete(campaign)} variant="destructive"><Trash className="size-3.5" />Hapus</DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
