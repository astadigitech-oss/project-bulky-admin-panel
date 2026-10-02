"use client";

import { useEffect, useState } from "react";
import { Bell, Send } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useQueryClient } from "@tanstack/react-query";
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
import Pagination from "@/components/pagination";
import { usePagination } from "@/hooks/use-pagination";
import type { MetaPagination } from "@/lib/types";
import { useMutate } from "@/lib/query";
import { useApiQuery } from "@/lib/query/use-query";

type PushRecipient = {
  buyer_id: string;
  buyer_name: string;
  email: string;
  device_count: number;
};

type ApiResponse<T> = { success: boolean; message: string; data: T };
type RecipientResponse = ApiResponse<{ data: PushRecipient[]; meta: MetaPagination }>;
type SendResponse = ApiResponse<{ success_count: number; failure_count: number }>;

export function PushTestClient() {
  const [search, setSearch] = useState("");
  const [selectedBuyers, setSelectedBuyers] = useState<PushRecipient[]>([]);
  const [confirming, setConfirming] = useState(false);
  const [lastResult, setLastResult] = useState<{ success: number; failed: number } | null>(null);
  const { page, limit, metaPage, setPage, setLimit, setPaginationData } = usePagination();
  const queryClient = useQueryClient();
  const { data, isLoading, isRefetching, isError } = useApiQuery<RecipientResponse>({
    key: ["push-test-recipients", search, page, limit],
    endpoint: "/marketing/push-test/recipients",
    searchParams: { search: search || undefined, page, per_page: limit },
  });
  const recipients = data?.data.data ?? [];
  const selectedRecipients = selectedBuyers.map(
    (selected) => recipients.find((recipient) => recipient.buyer_id === selected.buyer_id) ?? selected,
  );
  const selectedBuyerIDs = selectedRecipients.map((recipient) => recipient.buyer_id);
  const selectedDeviceCount = selectedRecipients.reduce((total, recipient) => total + recipient.device_count, 0);

  useEffect(() => {
    const meta = data?.data.meta;
    if (!meta) return;
    if (page > meta.last_page) {
      void setPage(meta.last_page);
      return;
    }
    setPaginationData(meta);
  }, [data, page]);

  const sendTest = useMutate<SendResponse, { buyer_ids: string[] }>({
    endpoint: "/marketing/push-test",
    method: "post",
    onSuccess: async ({ data: response }) => {
      setLastResult({ success: response.data.success_count, failed: response.data.failure_count });
      toast.success("Tes notifikasi selesai", {
        description: response.data.success_count + " perangkat berhasil dikirimi pesan, " + response.data.failure_count + " gagal.",
      });
      await queryClient.invalidateQueries({ queryKey: ["push-test-recipients"] });
    },
    onError: { title: "PUSH_TEST" },
  });

  const toggleBuyer = (recipient: PushRecipient, checked: boolean) => {
    if (checked && selectedBuyers.length >= 100) {
      toast.error("Maksimal 100 buyer untuk satu kali tes.");
      return;
    }
    setSelectedBuyers((current) => {
      if (checked) {
        return current.some((buyer) => buyer.buyer_id === recipient.buyer_id)
          ? current
          : [...current, recipient];
      }
      return current.filter((buyer) => buyer.buyer_id !== recipient.buyer_id);
    });
    setConfirming(false);
    setLastResult(null);
  };

  return (
    <section className="flex max-w-3xl flex-col gap-6 pt-4">
      <header>
        <h2 className="text-xl font-semibold leading-none">Tes Notifikasi</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Pilih satu atau beberapa buyer yang sudah mengaktifkan notifikasi. Pesan tes akan dikirim ke perangkat mereka.
        </p>
      </header>

      <div className="rounded-lg border bg-card p-5">
        <div className="mb-5 flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-full bg-primary/10 text-primary">
            <Bell className="size-5" />
          </span>
          <div>
            <h2 className="font-medium">Contoh pesan yang akan diterima</h2>
            <p className="text-sm text-muted-foreground">Pesan ini hanya untuk mencoba notifikasi.</p>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-md bg-muted/60 p-4">
            <p className="mb-1 text-xs font-semibold text-muted-foreground">Bahasa Indonesia</p>
            <p className="font-medium">Tes notifikasi Bulky.id 👋</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Hai! Ini hanya tes notifikasi dari tim Bulky.id. Maaf kalau pesan ini mengganggu kenyamananmu—kamu bisa abaikan saja. Terima kasih sudah membantu!
            </p>
          </div>
          <div className="rounded-md bg-muted/60 p-4">
            <p className="mb-1 text-xs font-semibold text-muted-foreground">English</p>
            <p className="font-medium">Bulky.id notification test 👋</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Hi! This is just a notification test from the Bulky.id team. Sorry for the interruption—feel free to ignore it. Thanks for helping us!
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4">
          <label className="grid gap-2 text-sm font-medium">
            Cari buyer
            <Input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                void setPage(1);
                setConfirming(false);
                setLastResult(null);
              }}
              placeholder="Nama atau email buyer"
              maxLength={100}
            />
          </label>

          <div className="grid gap-2">
            <p className="text-sm font-medium">Pilih penerima</p>
            <p className="text-xs text-muted-foreground">Pilih satu atau beberapa buyer, maksimal 100 untuk satu kali tes.</p>
            {recipients.length > 0 ? (
              <div className="grid max-h-72 gap-2 overflow-y-auto rounded-md border p-2" role="group" aria-label="Pilih buyer penerima">
                {recipients.map((recipient) => {
                  const checked = selectedBuyerIDs.includes(recipient.buyer_id);
                  return (
                    <div key={recipient.buyer_id} className="flex items-center gap-3 rounded-md px-2 py-2 hover:bg-muted/60">
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(nextChecked) => toggleBuyer(recipient, nextChecked === true)}
                        aria-label={"Pilih " + recipient.buyer_name}
                        disabled={!checked && selectedRecipients.length >= 100}
                      />
                      <button
                        type="button"
                        className="min-w-0 flex-1 text-left"
                        onClick={() => toggleBuyer(recipient, !checked)}
                        aria-pressed={checked}
                        disabled={!checked && selectedRecipients.length >= 100}
                      >
                        <span className="block truncate text-sm font-medium">{recipient.buyer_name}</span>
                        {recipient.email && <span className="block truncate text-xs text-muted-foreground">{recipient.email}</span>}
                      </button>
                      <span className="shrink-0 text-xs text-muted-foreground">{recipient.device_count} perangkat</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="rounded-md border p-3 text-sm text-muted-foreground">
                {isLoading
                  ? "Mencari buyer..."
                  : isError
                    ? "Daftar buyer tidak dapat dimuat. Coba muat ulang halaman."
                    : search
                      ? "Tidak ada buyer yang cocok. Coba kata pencarian lain."
                      : "Belum ada buyer yang mengaktifkan notifikasi."}
              </p>
            )}
            {data?.data.meta && data.data.meta.total > 0 && (
              <div className="mt-3">
                <Pagination
                  pagination={{ ...metaPage, current_page: page, per_page: limit }}
                  setPage={setPage}
                  setLimit={setLimit}
                  disabled={isLoading || isRefetching || sendTest.isPending}
                />
              </div>
            )}
          </div>

          {isError && recipients.length > 0 && (
            <p role="alert" className="text-sm text-destructive">Daftar buyer tidak dapat diperbarui. Coba muat ulang halaman.</p>
          )}

          {selectedRecipients.length > 0 && (
            <p className="rounded-md bg-muted/60 p-3 text-sm text-muted-foreground">
              {selectedRecipients.length} buyer dipilih ({selectedDeviceCount} perangkat):{" "}
              {selectedRecipients.map((recipient) => recipient.buyer_name).join(", ")}.
            </p>
          )}

          {lastResult && (
            <p role="status" className="text-sm text-muted-foreground">
              Hasil tes terakhir: {lastResult.success} perangkat berhasil, {lastResult.failed} gagal.
            </p>
          )}

          <Dialog open={confirming} onOpenChange={setConfirming}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Konfirmasi kirim tes</DialogTitle>
                <DialogDescription>
                  Kirim pesan tes ke {selectedRecipients.length} buyer dan seluruh {selectedDeviceCount} perangkat mereka?
                </DialogDescription>
              </DialogHeader>
              <div className="max-h-32 overflow-y-auto rounded-md bg-muted/60 p-3 text-sm text-muted-foreground">
                {selectedRecipients.map((recipient) => recipient.buyer_name).join(", ")}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setConfirming(false)} disabled={sendTest.isPending}>
                  Batal
                </Button>
                <Button
                  onClick={() => {
                    sendTest.mutate({ body: { buyer_ids: selectedBuyerIDs } });
                    setConfirming(false);
                  }}
                  disabled={sendTest.isPending}
                >
                  {sendTest.isPending ? "Mengirim..." : "Ya, kirim tes"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <div>
            <Button
              onClick={() => setConfirming(true)}
              disabled={selectedRecipients.length === 0 || sendTest.isPending || confirming}
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
