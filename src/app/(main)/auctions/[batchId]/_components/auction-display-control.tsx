"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";

import { useUpdateAuctionDisplay } from "../../_api";
import { AuctionBatchDetail } from "../../_api/types";

export const AuctionDisplayControl = ({
  batch,
  onDone,
}: {
  batch: AuctionBatchDetail;
  onDone?: () => void;
}) => {
  const [nextValue, setNextValue] = useState<boolean | null>(null);
  const { mutate, isPending } = useUpdateAuctionDisplay();
  const isShowing = batch.is_displayed;
  const willShow = nextValue ?? isShowing;

  const confirm = () => {
    if (nextValue === null) return;

    mutate(
      {
        body: { is_displayed: nextValue, version: batch.version },
        params: { id: batch.id },
        idempotencyKey: `auction-display-${batch.id}-${nextValue ? "show" : "hide"}-${batch.version}`,
      },
      {
        onSuccess: (response) => {
          toast.success(response.data.message);
          setNextValue(null);
          onDone?.();
        },
      },
    );
  };

  return (
    <>
      <div className="flex items-center gap-2 rounded-md border px-3 py-1.5">
        <div className="text-right">
          <p className="text-xs font-medium">Tampilan di Store</p>
          <p className="text-xs text-muted-foreground">
            {isShowing ? "Tampil" : "Disembunyikan"}
          </p>
        </div>
        <Switch
          checked={isShowing}
          disabled={isPending}
          aria-label="Ubah tampilan batch di Store"
          onCheckedChange={(checked) => setNextValue(checked)}
        />
      </div>

      <Dialog
        open={nextValue !== null}
        onOpenChange={(open) => {
          if (!open && !isPending) setNextValue(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {willShow ? "Tampilkan batch di Store?" : "Sembunyikan batch dari Store?"}
            </DialogTitle>
            <DialogDescription>
              {willShow
                ? "Batch ini akan dapat dilihat kembali oleh buyer di Store. Status lelangnya tidak berubah."
                : "Batch ini tidak lagi muncul di daftar atau halaman detail Store. Status lelang dan data pemenang tetap tersimpan."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              disabled={isPending}
              onClick={() => setNextValue(null)}
            >
              Batal
            </Button>
            <Button
              variant={willShow ? "default" : "destructive"}
              disabled={isPending}
              onClick={confirm}
            >
              {isPending && <Spinner className="size-3.5" />}
              {willShow ? "Ya, tampilkan" : "Ya, sembunyikan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
