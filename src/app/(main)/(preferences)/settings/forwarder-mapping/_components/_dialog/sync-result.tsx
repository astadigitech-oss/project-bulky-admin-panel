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
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import {
  CheckCircle2,
  CloudDownload,
  Info,
  MapPin,
  PlusCircle,
  Route,
} from "lucide-react";
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
          label: "Kota dari API",
          value: result.city_total_from_api,
          icon: CloudDownload,
          className: "text-foreground",
        },
        {
          label: "Kota Baru",
          value: result.city_created,
          icon: PlusCircle,
          className: "text-emerald-600 dark:text-emerald-400",
        },
        {
          label: "Kota Diperbarui",
          value: result.city_updated,
          icon: CheckCircle2,
          className: "text-blue-600 dark:text-blue-400",
        },
        {
          label: "Kecamatan dari API",
          value: result.subdistrict_total_from_api,
          icon: CloudDownload,
          className: "text-foreground",
        },
        {
          label: "Kecamatan Baru",
          value: result.subdistrict_created,
          icon: PlusCircle,
          className: "text-emerald-600 dark:text-emerald-400",
        },
        {
          label: "Kecamatan Diperbarui",
          value: result.subdistrict_updated,
          icon: CheckCircle2,
          className: "text-blue-600 dark:text-blue-400",
        },
      ]
    : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="w-full sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="size-5" />
            </span>
            Sync Berhasil
          </DialogTitle>
          <DialogDescription>
            Master data mapping kota & kecamatan Forwarder berhasil ditarik dari
            API dan disimpan.
          </DialogDescription>
        </DialogHeader>

        {result && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 rounded-lg bg-muted/60 px-3.5 py-2.5">
              <MapPin className="size-3.5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Kota
              </span>
              <span className="ml-auto flex items-center gap-3 text-sm font-semibold tabular-nums">
                <span className="flex items-center gap-1">
                  <PlusCircle className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                  {result.city_created} baru
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="size-3.5 text-blue-600 dark:text-blue-400" />
                  {result.city_updated} diupdate
                </span>
              </span>
            </div>

            <div className="flex items-center gap-2 rounded-lg bg-muted/60 px-3.5 py-2.5">
              <Route className="size-3.5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Kecamatan
              </span>
              <span className="ml-auto flex items-center gap-3 text-sm font-semibold tabular-nums">
                <span className="flex items-center gap-1">
                  <PlusCircle className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                  {result.subdistrict_created} baru
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="size-3.5 text-blue-600 dark:text-blue-400" />
                  {result.subdistrict_updated} diupdate
                </span>
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {items.slice(0, 3).map((item) => (
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

            <div className="flex items-start gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3.5 py-2.5 text-xs text-amber-700 dark:text-amber-300">
              <Info className="mt-0.5 size-3.5 shrink-0" />
              <span>
                Perubahan master data langsung dipakai untuk lookup alamat saat
                booking Forwarder. Disarankan melakukan sync di{" "}
                <b>luar jam sibuk transaksi</b>.
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
