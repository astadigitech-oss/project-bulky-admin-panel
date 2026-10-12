"use client";

import { AlertTriangle, Loader2, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { usePreviewWmsCargoIDSync } from "@api/product/list";

type DialogResyncWmsCargoIDsProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isSyncing: boolean;
  onApply: (previewToken: string, selectedProductIDs: string[]) => Promise<unknown>;
};

const metrics = [
  { key: "total_from_wms", label: "Cargo dari WMS" },
  { key: "matched", label: "Produk cocok" },
  { key: "legacy_id_cargo_matches", label: "Masih memakai ID lawas" },
  { key: "will_update", label: "Akan diperbarui" },
  { key: "already_current", label: "Sudah sesuai" },
  { key: "skipped_no_legacy_id", label: "Tanpa legacy_id" },
  { key: "not_found", label: "Produk tidak ditemukan" },
  { key: "failed", label: "Perlu ditinjau" },
] as const;

export const DialogResyncWmsCargoIDs = ({
  open,
  onOpenChange,
  isSyncing,
  onApply,
}: DialogResyncWmsCargoIDsProps) => {
  const [selection, setSelection] = useState<{
    previewToken: string;
    productIDs: string[];
  } | null>(null);
  useEffect(() => {
    if (!open) setSelection(null);
  }, [open]);
  const {
    data: response,
    isError,
    isFetching,
    refetch,
  } = usePreviewWmsCargoIDSync({ enabled: open });
  const preview = response?.data;
  const candidates = preview?.candidates ?? [];
  const selectedProductIDs =
    preview && selection?.previewToken === preview.preview_token
      ? selection.productIDs.filter((id) =>
          candidates.some((candidate) => candidate.product_id === id),
        )
      : [];
  const allSelected =
    candidates.length > 0 && selectedProductIDs.length === candidates.length;
  const partiallySelected =
    selectedProductIDs.length > 0 && !allSelected;
  const isPreviewing = open && isFetching && !preview;

  const setAllSelected = (checked: boolean) => {
    if (!preview) return;
    setSelection({
      previewToken: preview.preview_token,
      productIDs: checked ? candidates.map((candidate) => candidate.product_id) : [],
    });
  };

  const toggleCandidate = (productID: string, checked: boolean) => {
    if (!preview) return;
    const nextIDs = new Set(selectedProductIDs);
    if (checked) nextIDs.add(productID);
    else nextIDs.delete(productID);
    setSelection({
      previewToken: preview.preview_token,
      productIDs: [...nextIDs],
    });
  };

  const handleApply = async () => {
    if (!preview?.preview_token || selectedProductIDs.length === 0) return;
    try {
      await onApply(preview.preview_token, selectedProductIDs);
      onOpenChange(false);
    } catch {
      // The apply endpoint rejects stale previews; load current counts again.
      await refetch();
    }
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (isSyncing && !nextOpen) return;
    onOpenChange(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-5xl" showCloseButton={!isSyncing}>
        <DialogHeader>
          <DialogTitle>Preview re-sync palet WMS</DialogTitle>
          <DialogDescription>
            Preview ini hanya membaca data WMS dan produk Bulky. Perubahan baru
            dilakukan setelah kamu menekan Terapkan re-sync.
          </DialogDescription>
        </DialogHeader>

        {isPreviewing ? (
          <div className="flex min-h-32 items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Mengambil dan mencocokkan data WMS...
          </div>
        ) : null}

        {isError && !preview ? (
          <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
            Preview gagal dimuat. Periksa koneksi WMS, lalu muat ulang preview.
          </div>
        ) : null}

        {preview ? (
          <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <section className="grid content-start gap-3" aria-label="Ringkasan preview">
              <div className="grid grid-cols-2 gap-2">
                {metrics.map(({ key, label }) => (
                  <div key={key} className="rounded-lg border bg-muted/30 p-3">
                    <div className="text-xl font-semibold tabular-nums">
                      {preview[key]}
                    </div>
                    <div className="mt-1 text-xs leading-snug text-muted-foreground">
                      {label}
                    </div>
                  </div>
                ))}
              </div>

              {preview.not_found > 0 || preview.failed > 0 ? (
                <div className="flex gap-2 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
                  <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                  <div>
                    Ada cargo yang tidak ditemukan atau perlu ditinjau. Data tersebut
                    tidak akan diubah. Periksa ringkasan ini sebelum melanjutkan.
                    {preview.failures?.length ? (
                      <ul className="mt-2 list-inside list-disc text-xs">
                        {preview.failures.slice(0, 3).map((failure, index) => (
                          <li key={`${failure.legacy_id}-${index}`}>
                            {failure.code || `legacy_id ${failure.legacy_id}`}: {failure.reason}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </section>

            <section className="grid min-w-0 content-start gap-2" aria-label="Pilih produk untuk di-re-sync">
              {candidates.length > 0 ? (
                <>
                  <div className="flex items-center justify-between gap-3 rounded-md border px-3 py-2">
                    <div className="flex min-w-0 items-center gap-2 text-sm font-medium">
                      <Checkbox
                        checked={
                          partiallySelected ? "indeterminate" : allSelected
                        }
                        onCheckedChange={(checked) =>
                          setAllSelected(checked === true)
                        }
                        disabled={isFetching || isSyncing}
                        aria-label="Pilih semua produk yang dapat diperbarui"
                      />
                      <span>Pilih semua yang bisa diperbarui</span>
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {selectedProductIDs.length} dari {candidates.length} dipilih
                    </span>
                  </div>
                  <div className="overflow-hidden rounded-md border">
                    <div className="grid max-h-80 gap-2 overflow-y-auto p-2 sm:max-h-96">
                      {candidates.map((candidate) => {
                        const checked = selectedProductIDs.includes(candidate.product_id);
                        return (
                          <div
                            key={candidate.product_id}
                            className="flex cursor-pointer items-start gap-3 rounded-md px-2 py-2 hover:bg-muted/60"
                          >
                            <Checkbox
                              checked={checked}
                              onCheckedChange={(nextChecked) =>
                                toggleCandidate(candidate.product_id, nextChecked === true)
                              }
                              disabled={isFetching || isSyncing}
                              aria-label={"Pilih produk " + candidate.product_name}
                            />
                            <button
                              type="button"
                              className="min-w-0 flex-1 text-left"
                              onClick={() => toggleCandidate(candidate.product_id, !checked)}
                              disabled={isFetching || isSyncing}
                              aria-pressed={checked}
                            >
                              <span className="block truncate text-sm font-medium">
                                {candidate.product_name}
                              </span>
                              <span className="mt-0.5 block text-xs text-muted-foreground">
                                Legacy ID {candidate.legacy_id} · ID cargo saat ini: {candidate.current_id_cargo || "—"} · reference_code saat ini: {candidate.current_reference_code || "—"}
                              </span>
                              <span className="mt-1 block text-xs">
                                <span className="font-medium">
                                  Code cargo baru: {candidate.wms_code}
                                </span>
                                <span className="mt-0.5 block break-all font-mono text-muted-foreground">
                                  ID cargo baru: {candidate.wms_id}
                                </span>
                              </span>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              ) : (
                <div className="rounded-md border p-4 text-sm text-muted-foreground">
                  Tidak ada produk yang memenuhi syarat update dari preview ini.
                </div>
              )}
            </section>
          </div>
        ) : null}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => void refetch()}
            disabled={isFetching || isSyncing}
          >
            <RefreshCw className={`size-3.5 ${isFetching ? "animate-spin" : ""}`} />
            Muat ulang preview
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSyncing}
          >
            Batal
          </Button>
          <Button
            type="button"
            onClick={() => void handleApply()}
            disabled={!preview || selectedProductIDs.length === 0 || isFetching || isSyncing}
          >
            {isSyncing ? <Loader2 className="size-3.5 animate-spin" /> : null}
            {isSyncing
              ? "Menerapkan..."
              : selectedProductIDs.length
                ? "Terapkan " + selectedProductIDs.length + " update"
                : "Tidak ada update"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
