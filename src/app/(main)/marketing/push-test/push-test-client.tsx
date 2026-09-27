"use client";

import { useState } from "react";
import { Bell, Send } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMutate } from "@/lib/query";
import { useApiQuery } from "@/lib/query/use-query";

type PushRecipient = {
  buyer_id: string;
  buyer_name: string;
  email: string;
  device_count: number;
};

type ApiResponse<T> = { success: boolean; message: string; data: T };
type RecipientResponse = ApiResponse<PushRecipient[]>;
type SendResponse = ApiResponse<{ success_count: number; failure_count: number }>;

export function PushTestClient() {
  const [search, setSearch] = useState("");
  const [buyerID, setBuyerID] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [lastResult, setLastResult] = useState<{ success: number; failed: number } | null>(null);
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useApiQuery<RecipientResponse>({
    key: ["push-test-recipients", search],
    endpoint: "/marketing/push-test/recipients",
    searchParams: search ? { search } : undefined,
  });
  const recipients = data?.data ?? [];
  const selectedRecipient = recipients.find((recipient) => recipient.buyer_id === buyerID);

  const sendTest = useMutate<SendResponse, { buyer_id: string }>({
    endpoint: "/marketing/push-test",
    method: "post",
    onSuccess: async ({ data: response }) => {
      setLastResult({ success: response.data.success_count, failed: response.data.failure_count });
      toast.success(response.message, {
        description: `${response.data.success_count} perangkat menerima permintaan, ${response.data.failure_count} gagal.`,
      });
      await queryClient.invalidateQueries({ queryKey: ["push-test-recipients"] });
    },
    onError: { title: "PUSH_TEST" },
  });

  return (
    <section className="flex max-w-3xl flex-col gap-6 pt-4">
      <header>
        <h1 className="text-2xl font-semibold leading-none">Tes Push Notification</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Pilih buyer yang sudah mendaftarkan perangkat. Pesan tes akan dikirim ke semua perangkat buyer tersebut.
        </p>
      </header>

      <div className="rounded-lg border bg-card p-5">
        <div className="mb-5 flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-full bg-primary/10 text-primary">
            <Bell className="size-5" />
          </span>
          <div>
            <h2 className="font-medium">Pesan yang akan dikirim</h2>
            <p className="text-sm text-muted-foreground">Isi pesan tetap untuk memastikan format FCM dasar.</p>
          </div>
        </div>
        <div className="rounded-md bg-muted/60 p-4">
          <p className="font-medium">Tes Notifikasi Bulky</p>
          <p className="mt-1 text-sm text-muted-foreground">Notifikasi percobaan berhasil dikirim.</p>
        </div>

        <div className="mt-6 grid gap-4">
          <label className="grid gap-2 text-sm font-medium">
            Cari buyer
            <Input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setBuyerID("");
                setConfirming(false);
                setLastResult(null);
              }}
              placeholder="Nama atau email buyer"
              maxLength={100}
            />
          </label>

          <label className="grid gap-2 text-sm font-medium">
            Buyer penerima
            <select
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              value={buyerID}
              onChange={(event) => {
                setBuyerID(event.target.value);
                setConfirming(false);
                setLastResult(null);
              }}
              disabled={isLoading || recipients.length === 0}
            >
              <option value="">
                {isLoading ? "Memuat buyer..." : "Pilih buyer dengan perangkat aktif"}
              </option>
              {recipients.map((recipient) => (
                <option key={recipient.buyer_id} value={recipient.buyer_id}>
                  {recipient.buyer_name}{recipient.email ? ` — ${recipient.email}` : ""} ({recipient.device_count} perangkat)
                </option>
              ))}
            </select>
          </label>

          {isError && <p role="alert" className="text-sm text-destructive">Daftar buyer gagal dimuat. Coba muat ulang halaman.</p>}
          {!isLoading && !isError && recipients.length === 0 && (
            <p className="text-sm text-muted-foreground">Belum ada buyer aktif yang memiliki perangkat push terdaftar.</p>
          )}

          {selectedRecipient && (
            <p className="text-sm text-muted-foreground">
              Tes akan dikirim ke {selectedRecipient.device_count} perangkat milik {selectedRecipient.buyer_name}.
            </p>
          )}

          {lastResult && (
            <p role="status" className="text-sm text-muted-foreground">
              Hasil pengiriman terakhir: {lastResult.success} berhasil, {lastResult.failed} gagal.
            </p>
          )}

          {confirming && selectedRecipient && (
            <div className="rounded-md border border-amber-500/40 bg-amber-500/5 p-4" role="alert">
              <p className="text-sm">
                Kirim pesan tes ke semua {selectedRecipient.device_count} perangkat milik {selectedRecipient.buyer_name}?
              </p>
              <div className="mt-3 flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setConfirming(false)} disabled={sendTest.isPending}>
                  Batal
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    sendTest.mutate({ body: { buyer_id: buyerID } });
                    setConfirming(false);
                  }}
                  disabled={sendTest.isPending}
                >
                  {sendTest.isPending ? "Mengirim..." : "Ya, kirim tes"}
                </Button>
              </div>
            </div>
          )}

          <div>
            <Button
              onClick={() => setConfirming(true)}
              disabled={!buyerID || sendTest.isPending || confirming}
            >
              <Send className="size-4" />
              Kirim tes
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
