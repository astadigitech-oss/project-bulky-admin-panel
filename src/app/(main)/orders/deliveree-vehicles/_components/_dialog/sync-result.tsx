"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { CheckCircle2, CircleSlash2, CloudDownload, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { SyncResult } from "../../_api/types";

export const DialogSyncResult = ({
  open,
  onOpenChange,
  result,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  result: SyncResult | null;
}) => {
  const items = result
    ? [
        {
          label: "Total dari API",
          value: result.total_from_api,
          icon: CloudDownload,
          className: "text-foreground",
        },
        {
          label: "Baru",
          value: result.created,
          icon: PlusCircle,
          className: "text-emerald-600 dark:text-emerald-400",
        },
        {
          label: "Diperbarui",
          value: result.updated,
          icon: CheckCircle2,
          className: "text-blue-600 dark:text-blue-400",
        },
        {
          label: "Dinonaktifkan",
          value: result.deactivated,
          icon: CircleSlash2,
          className: "text-amber-600 dark:text-amber-400",
        },
      ]
    : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="w-full sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="size-5" />
            </span>
            Sync Berhasil
          </DialogTitle>
          <DialogDescription>
            Data kendaraan Deliveree berhasil ditarik dari API dan disimpan
            sebagai master data.
          </DialogDescription>
        </DialogHeader>

        {result && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between rounded-lg bg-muted/60 px-3.5 py-2.5">
              <span className="text-sm text-muted-foreground">Lingkungan</span>
              <Badge
                variant="outline"
                className={cn(
                  "gap-1.5 border-transparent font-medium",
                  result.environment === "sandbox"
                    ? "bg-amber-500/15 text-amber-600 dark:bg-amber-500/20 dark:text-amber-300"
                    : "bg-blue-500/15 text-blue-600 dark:bg-blue-500/20 dark:text-blue-300",
                )}
              >
                <span
                  className={cn(
                    "size-1.5 rounded-full",
                    result.environment === "sandbox"
                      ? "bg-amber-500"
                      : "bg-blue-500",
                  )}
                />
                {result.environment === "sandbox" ? "Sandbox" : "Produksi"}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {items.map((item) => (
                <div
                  key={item.label}
                  className="flex flex-col gap-1.5 rounded-lg border border-border/70 px-3.5 py-3"
                >
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <item.icon className={cn("size-3.5", item.className)} />
                    <span className="text-xs">{item.label}</span>
                  </div>
                  <span className="text-2xl font-semibold tabular-nums leading-none">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>

            <div className="text-center text-xs text-muted-foreground">
              Disinkronkan pada{" "}
              <span className="font-medium text-foreground">
                {format(result.synced_at, "PPpp", { locale: idLocale })}
              </span>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button type="button" onClick={() => onOpenChange(false)}>
            Selesai
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
