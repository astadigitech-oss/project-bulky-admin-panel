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
import { Switch } from "@/components/ui/switch";

import { useUpdateOperations } from "../../_api";
import { AuctionBatchDetail } from "../../_api/types";

export const AuctionStatusControl = ({
  batch,
  onDone,
}: {
  batch: AuctionBatchDetail;
  onDone?: () => void;
}) => {
  const [nextStatus, setNextStatus] = useState<"OPEN" | "SOLD" | null>(null);
  const [note, setNote] = useState("");
  const { mutate, isPending } = useUpdateOperations();
  const isOpen = batch.status === "OPEN";
  const willBeOpen = nextStatus === "OPEN";

  const closeDialog = () => {
    setNextStatus(null);
    setNote("");
  };

  const confirm = () => {
    if (!nextStatus) return;

    if (!note.trim()) {
      toast.error("Catatan perubahan status wajib diisi");
      return;
    }

    mutate(
      {
        body: {
          version: batch.version,
          batch_status: nextStatus,
          note: note.trim(),
        },
        params: { id: batch.id },
        idempotencyKey: `ops-status-${batch.id}-${batch.version}-${nextStatus.toLowerCase()}`,
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

  return (
    <>
      <div className="flex items-center gap-2 rounded-md border px-3 py-1.5">
        <div className="text-right">
          <p className="text-xs font-medium">Status Batch</p>
          <p className="text-xs text-muted-foreground">
            {isOpen ? "Pencatatan bid aktif" : "Batch ditandai terjual"}
          </p>
        </div>
        <Switch
          checked={isOpen}
          disabled={isPending}
          aria-label="Ubah status batch dan pencatatan bid"
          onCheckedChange={(checked) => setNextStatus(checked ? "OPEN" : "SOLD")}
        />
      </div>

      <Dialog
        open={nextStatus !== null}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            if (!isPending) closeDialog();
            return;
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {!willBeOpen
                ? "Tandai batch sebagai terjual?"
                : "Aktifkan pencatatan bid tambahan?"}
            </DialogTitle>
            <DialogDescription>
              {!willBeOpen
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
              variant={!willBeOpen ? "destructive" : "default"}
              onClick={confirm}
              disabled={isPending || !note.trim() || nextStatus === null}
            >
              {isPending && <Spinner className="size-3.5" />}
              {!willBeOpen
                ? "Ya, tandai terjual"
                : "Ya, aktifkan pencatatan bid"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
