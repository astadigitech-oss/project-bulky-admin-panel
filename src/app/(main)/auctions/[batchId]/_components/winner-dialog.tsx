"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { useSelectWinner } from "../../_api";
import { toast } from "sonner";
import { formatRupiah } from "@/lib/utils";
import { useState } from "react";
import { AuctionBatchDetail, AuctionBidDetail } from "../../_api/types";

export const WinnerDialog = ({
  open,
  onOpenChange,
  batch,
  bid,
  onDone,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  batch: AuctionBatchDetail;
  bid: AuctionBidDetail | null;
  onDone?: () => void;
}) => {
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<"OPEN" | "SOLD">("OPEN");
  const { mutate, isPending } = useSelectWinner();

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setNote("");
      setStatus("OPEN");
    }
    onOpenChange(nextOpen);
  };

  const handleConfirm = () => {
    if (!bid) return;
    mutate(
      {
        body: {
          bid_id: bid.id,
          version: batch.version,
          status,
          note: note || null,
        },
        params: { id: batch.id },
        idempotencyKey: `winner-${batch.id}-${bid.id}-${status.toLowerCase()}`,
      },
      {
        onSuccess: (data) => {
          toast.success(data.data.message);
          handleOpenChange(false);
          onDone?.();
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Konfirmasi Pemenang</DialogTitle>
          <DialogDescription>
            Pilih {bid?.buyer.nama} sebagai pemenang untuk {batch.nama_id}?
          </DialogDescription>
        </DialogHeader>

        {bid && (
          <div className="grid gap-2 text-sm">
            <Row label="Buyer" value={bid.buyer.nama} />
            <Row label="Telepon" value={bid.buyer.telepon} />
            <Row label="Bid ke-" value={String(bid.sequence)} />
            <Row label="Nominal" value={formatRupiah(bid.amount)} />
            <Row
              label="Persentase"
              value={`${bid.effective_percent}%`}
            />
            <Row label="Harga Deal" value={formatRupiah(bid.amount)} />
          </div>
        )}

        <div className="grid gap-2">
          <Label htmlFor="winner-status">Status batch setelah pemenang dipilih</Label>
          <select
            id="winner-status"
            className="native-select h-9 rounded-md border border-input bg-background py-1 text-sm shadow-sm"
            value={status}
            onChange={(event) => setStatus(event.target.value as "OPEN" | "SOLD")}
            disabled={isPending}
          >
            <option value="OPEN">Buka (default)</option>
            <option value="SOLD">Terjual</option>
          </select>
          <p className="text-xs text-muted-foreground">
            {status === "OPEN"
              ? "Batch tetap tampil dan dapat menerima bid tambahan sebagai pencatatan. Pemenang tidak berubah."
              : "Batch ditampilkan sebagai terjual dan tidak menerima bid baru."}
          </p>
          <p className="text-xs text-muted-foreground">
            Pembayaran dan fulfillment pemenang tetap dicatat manual.
          </p>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="winner-note">Catatan (Opsional)</Label>
          <Input
            id="winner-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Catatan pemenang..."
            maxLength={1000}
          />
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            disabled={isPending}
            onClick={() => onOpenChange(false)}
          >
            Batal
          </Button>
          <Button disabled={isPending || !bid} onClick={handleConfirm}>
            {isPending && <Spinner className="size-3.5" />}
            Konfirmasi Pemenang
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const Row = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between">
    <span className="text-xs text-muted-foreground">{label}</span>
    <span className="font-medium">{value}</span>
  </div>
);
