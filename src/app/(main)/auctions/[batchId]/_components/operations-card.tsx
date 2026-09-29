"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { useUpdateOperations } from "../../_api";
import { toast } from "sonner";
import { formatRupiah } from "@/lib/utils";
import { useState } from "react";
import { AuctionBatchDetail } from "../../_api/types";

export const OperationsCard = ({
  batch,
  onDone,
}: {
  batch: AuctionBatchDetail;
  onDone?: () => void;
}) => {
  const winner = batch.winner;
  const [note, setNote] = useState("");
  const { mutate, isPending } = useUpdateOperations();

  if (!winner) return null;

  const handlePayment = () => {
    if (!note.trim()) {
      toast.error("Catatan/referensi pembayaran wajib diisi");
      return;
    }
    mutate(
      {
        body: {
          version: batch.version,
          payment_status: "PAID",
          note,
        },
        params: { id: batch.id },
        idempotencyKey: `ops-payment-${batch.id}`,
      },
      {
        onSuccess: (data) => {
          toast.success(data.data.message);
          setNote("");
          onDone?.();
        },
      },
    );
  };

  const handleFulfillment = (target: "PROCESSING" | "COMPLETED") => {
    if (!note.trim()) {
      toast.error("Catatan serah-terima wajib diisi");
      return;
    }
    mutate(
      {
        body: {
          version: batch.version,
          fulfillment_status: target,
          note,
        },
        params: { id: batch.id },
        idempotencyKey: `ops-fulfillment-${batch.id}-${target}`,
      },
      {
        onSuccess: (data) => {
          toast.success(data.data.message);
          setNote("");
          onDone?.();
        },
      },
    );
  };

  const canProcess = winner.payment_status === "PAID";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Operasi Manual</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <InfoBlock label="Pemenang" value={winner.buyer.nama} />
          <InfoBlock label="Harga Deal" value={formatRupiah(winner.deal_amount)} />
          <InfoBlock
            label="Pembayaran"
            value={winner.payment_status}
            badge={winner.payment_status === "PAID" ? "default" : "secondary"}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="ops-note">Catatan / Referensi</Label>
          <Input
            id="ops-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Catatan pembayaran / serah-terima..."
            maxLength={1000}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {winner.payment_status === "UNPAID" && (
            <Button
              size="sm"
              disabled={isPending}
              onClick={handlePayment}
            >
              {isPending && <Spinner className="size-3.5" />}
              Tandai Dibayar (PAID)
            </Button>
          )}

          {winner.fulfillment_status === "PENDING" && (
            <Button
              size="sm"
              variant="outline"
              disabled={isPending || !canProcess}
              onClick={() => handleFulfillment("PROCESSING")}
            >
              Proses (PROCESSING)
            </Button>
          )}

          {winner.fulfillment_status === "PROCESSING" && (
            <Button
              size="sm"
              variant="outline"
              disabled={isPending}
              onClick={() => handleFulfillment("COMPLETED")}
            >
              Selesai (COMPLETED)
            </Button>
          )}

          {winner.fulfillment_status === "COMPLETED" && (
            <Badge variant="default">Selesai</Badge>
          )}
        </div>

        {winner.fulfillment_status === "PENDING" && !canProcess && (
          <p className="text-xs text-muted-foreground">
            Fulfillment hanya bisa diproses setelah pembayaran PAID.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

const InfoBlock = ({
  label,
  value,
  badge,
}: {
  label: string;
  value: string;
  badge?: "default" | "secondary" | "outline" | "destructive";
}) => (
  <div className="rounded-md border p-3">
    <p className="text-xs text-muted-foreground">{label}</p>
    {badge ? (
      <Badge variant={badge} className="mt-1 capitalize">
        {value}
      </Badge>
    ) : (
      <p className="mt-1 text-sm font-semibold">{value}</p>
    )}
  </div>
);
