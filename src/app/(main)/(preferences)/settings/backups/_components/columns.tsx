import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { TooltipText } from "@/providers/tooltip-provider";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { Download, FileArchive, Trash2 } from "lucide-react";
import { BackupItem } from "../_api/data";

export const column = ({
  handleDownload,
  handleDelete,
  disabled,
}: {
  handleDownload: (filename: string) => Promise<void>;
  handleDelete: (filename: string) => Promise<void>;
  disabled: boolean;
}): ColumnDef<BackupItem>[] => [
  {
    id: "index",
    header: () => <div className="text-center w-12">No</div>,
    cell: ({ row }) => (
      <div className="text-center tabular-nums font-medium text-muted-foreground w-12">
        {row.index + 1}
      </div>
    ),
  },
  {
    accessorKey: "filename",
    header: "Nama File",
    cell: ({ row }) => (
      <div className="flex items-center gap-2.5">
        <div className="p-2 rounded-lg bg-primary/10 text-primary">
          <FileArchive className="size-4" />
        </div>
        <div className="flex flex-col">
          <span className="font-mono text-xs font-medium text-foreground">
            {row.original.filename}
          </span>
          <span className="text-[11px] text-muted-foreground">
            PostgreSQL Dump (.sql.gz)
          </span>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "size_formatted",
    header: "Ukuran",
    cell: ({ row }) => (
      <span className="font-medium text-xs tabular-nums">
        {row.original.size_formatted}
      </span>
    ),
  },
  {
    accessorKey: "trigger_type",
    header: "Tipe",
    cell: ({ row }) => {
      const isAuto = row.original.trigger_type === "AUTO";
      return (
        <Badge
          variant="outline"
          className={cn(
            "text-[11px] font-medium px-2 py-0.5 rounded-full border-none",
            isAuto
              ? "bg-blue-500/15 text-blue-600 dark:bg-blue-500/25 dark:text-blue-300"
              : "bg-purple-500/15 text-purple-600 dark:bg-purple-500/25 dark:text-purple-300",
          )}
        >
          {isAuto ? "Otomatis" : "Manual"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "created_at",
    header: "Waktu Backup",
    cell: ({ row }) => {
      try {
        return (
          <div className="flex flex-col">
            <span className="text-xs font-medium">
              {format(new Date(row.original.created_at), "dd MMM yyyy, HH:mm", {
                locale: idLocale,
              })}{" "}
              WIB
            </span>
            <span className="text-[11px] text-muted-foreground">
              {format(new Date(row.original.created_at), "PPpp", {
                locale: idLocale,
              })}
            </span>
          </div>
        );
      } catch {
        return <span className="text-xs">{row.original.created_at}</span>;
      }
    },
  },
  {
    id: "actions",
    header: () => <div className="text-right pr-4">Aksi</div>,
    cell: ({ row }) => (
      <div className="flex items-center justify-end gap-1.5 pr-2">
        <TooltipText
          value="Download File Backup"
          render={
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-2.5 text-xs gap-1.5"
              disabled={disabled}
              onClick={() => handleDownload(row.original.filename)}
            >
              <Download className="size-3.5" />
              Download
            </Button>
          }
        />
        <TooltipText
          value="Hapus File Backup"
          render={
            <Button
              variant="ghost"
              size="icon-xs"
              className="text-destructive hover:bg-destructive/10"
              disabled={disabled}
              onClick={() => handleDelete(row.original.filename)}
            >
              <Trash2 className="size-3.5" />
            </Button>
          }
        />
      </div>
    ),
  },
];
