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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";

import { useUpdateOperations } from "../../_api";
import { AuctionBatchDetail } from "../../_api/types";

export const AuctionStatusControl = ({
  batch,
  onDone,
}: {
  batch: AuctionBatchDetail;
  onDone?: () => void;
}) => {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  const { mutate, isPending } = useUpdateOperations();
  const targetStatus = batch.status === "OPEN" ? "SOLD" : "OPEN";

  const closeDialog = () => {
    setOpen(false);
    setNote("");
  };

  const confirm = () => {
    if (!note.trim()) {
      toast.error("Catatan perubahan status wajib diisi");
      return;
    }

    mutate(
      {
        body: {
          version: batch.version,
          batch_status: targetStatus,
          note: note.trim(),
        },
        params: { id: batch.id },
        idempotencyKey: `ops-status-${batch.id}-${batch.version}-${targetStatus.toLowerCase()}`,
      },
      {
        onSuccess: (response) => {
          toast.success(response.data.message);
          closeDialog();
          onDone?.();
        },
      },
    );
  };

  const isSold = targetStatus === "SOLD";
  const actionLabel = isSold
    ? "Tandai terjual"
    : "Aktifkan pencatatan bid";

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        onClick={() => setOpen(true)}
        disabled={isPending}
      >
        {actionLabel}
      </Button>

      <Dialog
        open={open}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            if (!isPending) closeDialog();
            return;
          }
          setOpen(true);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {isSold
                ? "Tandai batch sebagai terjual?"
                : "Aktifkan pencatatan bid tambahan?"}
            </DialogTitle>
            <DialogDescription>
              {isSold
                ? "Batch akan berhenti menerima bid baru. Pemenang yang sudah dipilih tetap sama, dan pengaturan tampil di Store tidak berubah."
                : "Bid tambahan hanya akan dicatat dan tidak mengubah pemenang yang sudah dipilih. Pengaturan tampil di Store tidak berubah."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-2">
            <Label htmlFor="auction-status-note">
              Alasan perubahan (wajib)
            </Label>
            <Input
              id="auction-status-note"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Tulis alasan perubahan..."
              maxLength={1000}
              disabled={isPending}
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={closeDialog}
              disabled={isPending}
            >
              Batal
            </Button>
            <Button
              variant={isSold ? "destructive" : "default"}
              onClick={confirm}
              disabled={isPending || !note.trim()}
            >
              {isPending && <Spinner className="size-3.5" />}
              {isSold
                ? "Ya, tandai terjual"
                : "Ya, aktifkan pencatatan bid"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
