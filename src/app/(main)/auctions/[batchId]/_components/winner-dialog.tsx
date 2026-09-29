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
  const { mutate, isPending } = useSelectWinner();

  const handleConfirm = () => {
    if (!bid) return;
    mutate(
      {
        body: {
          bid_id: bid.id,
          version: batch.version,
          note: note || null,
        },
        params: { id: batch.id },
        idempotencyKey: `winner-${batch.id}-${bid.id}`,
      },
      {
        onSuccess: (data) => {
          toast.success(data.data.message);
          onOpenChange(false);
          setNote("");
          onDone?.();
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
            <p className="text-xs text-muted-foreground">
              Batch akan berstatus Terjual (SOLD) dan tidak menerima bid baru.
              Pembayaran tetap dicatat manual.
            </p>
          </div>
        )}

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
