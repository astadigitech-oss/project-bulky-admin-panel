"use client";

import { useEffect, useMemo, useState } from "react";
import { BellRing, CalendarClock, CircleAlert, Plus, Send, Trash2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { useMe } from "@/components/container/_api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useMutate } from "@/lib/query";
import { useApiQuery } from "@/lib/query/use-query";

type PushPromotionStatus = "DRAFT" | "SCHEDULED" | "SENDING" | "SENT" | "FAILED";
type PushPromotion = {
  id: string;
  nama: string;
  title_id: string;
  body_id: string;
  title_en: string;
  body_en: string;
  deep_link: string;
  scheduled_at: string | null;
  status: PushPromotionStatus;
  sent_at: string | null;
  success_count: number;
  failure_count: number;
  last_error?: string;
  created_at: string;
};
type ApiResponse<T> = { success: boolean; message: string; data: T };
type ListResponse = ApiResponse<{ data: PushPromotion[]; meta: { page: number; per_page: number; total: number; last_page: number } }>;
type MutationResponse = ApiResponse<PushPromotion | null>;
type FormBody = {
  nama: string;
  title_id: string;
  body_id: string;
  title_en: string;
  body_en: string;
  deep_link: string;
  scheduled_at?: string;
};

type FormState = Omit<FormBody, "scheduled_at"> & { scheduled_local: string };
const emptyForm: FormState = {
  nama: "",
  title_id: "",
  body_id: "",
  title_en: "",
  body_en: "",
  deep_link: "/",
  scheduled_local: "",
};
const listKey = ["push-promotions"];

function toLocalDateTime(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

function statusLabel(status: PushPromotionStatus) {
  return {
    DRAFT: "Draft",
    SCHEDULED: "Terjadwal",
    SENDING: "Sedang dikirim",
    SENT: "Terkirim",
    FAILED: "Gagal",
  }[status];
}

function statusClass(status: PushPromotionStatus) {
  if (status === "SENT") return "bg-emerald-100 text-emerald-800";
  if (status === "FAILED") return "bg-red-100 text-red-800";
  if (status === "SCHEDULED" || status === "SENDING") return "bg-blue-100 text-blue-800";
  return "bg-muted text-muted-foreground";
}

export function PushPromotionsClient() {
  const queryClient = useQueryClient();
  const { data: meData } = useMe();
  const canManage = meData?.data?.permissions?.includes("marketing:manage") ?? false;
  const [status, setStatus] = useState("");
  const [selected, setSelected] = useState<PushPromotion | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const query = useApiQuery<ListResponse>({
    key: [...listKey, status],
    endpoint: "/marketing/push-promotions",
    searchParams: { page: 1, per_page: 50, status: status || undefined },
  });
  const promos = query.data?.data?.data ?? [];
  const refresh = async () => queryClient.invalidateQueries({ queryKey: listKey });
  const onSaved = async (response: { data: MutationResponse }) => {
    toast.success(response.data.message);
    const saved = response.data.data;
    if (saved) {
      setSelected(saved);
      setForm({ ...saved, scheduled_local: toLocalDateTime(saved.scheduled_at) });
    }
    await refresh();
  };
  const create = useMutate<MutationResponse, FormBody>({
    endpoint: "/marketing/push-promotions",
    method: "post",
    onSuccess: onSaved,
    onError: { title: "CREATE_PUSH_PROMOTION" },
  });
  const update = useMutate<MutationResponse, FormBody, { id: string }>({
    endpoint: "/marketing/push-promotions/:id",
    method: "put",
    onSuccess: onSaved,
    onError: { title: "UPDATE_PUSH_PROMOTION" },
  });
  const send = useMutate<MutationResponse, undefined, { id: string }>({
    endpoint: "/marketing/push-promotions/:id/send",
    method: "post",
    onSuccess: async ({ data }) => {
      toast.success(data.message);
      if (data.data) {
        setSelected(data.data);
        setForm({ ...data.data, scheduled_local: toLocalDateTime(data.data.scheduled_at) });
      }
      await refresh();
    },
    onError: { title: "SEND_PUSH_PROMOTION" },
  });
  const cancelSchedule = useMutate<MutationResponse, undefined, { id: string }>({
    endpoint: "/marketing/push-promotions/:id/cancel-schedule",
    method: "patch",
    onSuccess: async ({ data }) => {
      toast.success(data.message);
      if (data.data) {
        setSelected(data.data);
        setForm({ ...data.data, scheduled_local: toLocalDateTime(data.data.scheduled_at) });
      }
      await refresh();
    },
    onError: { title: "CANCEL_PUSH_PROMOTION_SCHEDULE" },
  });
  const remove = useMutate<MutationResponse, undefined, { id: string }>({
    endpoint: "/marketing/push-promotions/:id",
    method: "delete",
    onSuccess: async ({ data }) => { toast.success(data.message); setSelected(null); setForm(emptyForm); await refresh(); },
    onError: { title: "DELETE_PUSH_PROMOTION" },
  });
  const mutationBusy = create.isPending || update.isPending || send.isPending || cancelSchedule.isPending || remove.isPending;
  const selectedEditable = !selected || ["DRAFT", "SCHEDULED", "FAILED"].includes(selected.status);
  const canDelete = selected && ["DRAFT", "FAILED"].includes(selected.status);
  const preview = useMemo(() => ({
    id: form.title_id || "Judul notifikasi bahasa Indonesia",
    body: form.body_id || "Isi notifikasi bahasa Indonesia akan tampil di sini.",
    en: form.title_en || "English notification title",
    bodyEN: form.body_en || "English notification body will appear here.",
  }), [form.title_id, form.body_id, form.title_en, form.body_en]);

  useEffect(() => {
    if (!selected) return;
    setForm({ ...selected, scheduled_local: toLocalDateTime(selected.scheduled_at) });
  }, [selected]);

  const selectPromo = (promo: PushPromotion) => {
    setSelected(promo);
    setForm({ ...promo, scheduled_local: toLocalDateTime(promo.scheduled_at) });
  };

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const buildBody = (schedule: boolean): FormBody | null => {
    const body: FormBody = {
      nama: form.nama.trim(),
      title_id: form.title_id.trim(),
      body_id: form.body_id.trim(),
      title_en: form.title_en.trim(),
      body_en: form.body_en.trim(),
      deep_link: form.deep_link.trim(),
    };
    if (!body.nama || !body.title_id || !body.body_id || !body.title_en || !body.body_en || !body.deep_link.startsWith("/") || body.deep_link.startsWith("//")) {
      toast.error("Lengkapi nama, konten ID/EN, dan path Store yang valid.");
      return null;
    }
    if (schedule) {
      if (!form.scheduled_local) {
        toast.error("Pilih tanggal dan waktu pengiriman.");
        return null;
      }
      const scheduled = new Date(form.scheduled_local);
      if (!Number.isFinite(scheduled.getTime()) || scheduled.getTime() <= Date.now()) {
        toast.error("Jadwal harus berada di masa depan.");
        return null;
      }
      body.scheduled_at = scheduled.toISOString();
    } else {
      body.scheduled_at = "";
    }
    return body;
  };

  const save = (schedule: boolean) => {
    const body = buildBody(schedule);
    if (!body) return;
    if (selected) update.mutate({ params: { id: selected.id }, body });
    else create.mutate({ body });
  };

  const sendNow = (promo: PushPromotion) => {
    if (!window.confirm(`Kirim notifikasi “${promo.nama}” sekarang ke seluruh perangkat Store yang aktif?`)) return;
    send.mutate({ params: { id: promo.id } });
  };

  const startNew = () => { setSelected(null); setForm(emptyForm); };

  return (
    <section className="flex flex-col gap-5 py-4">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold leading-none">Promo Berlangsung</h2>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground">Buat notifikasi promo untuk Store dalam Bahasa Indonesia dan Inggris. Kirim langsung atau jadwalkan pengirimannya.</p>
        </div>
        {canManage && <Button onClick={startNew} disabled={mutationBusy}><Plus className="size-4" />Buat notifikasi</Button>}
      </header>

      {!canManage ? (
        <p role="alert" className="rounded-lg border p-4 text-sm text-muted-foreground">Akses pengelolaan notifikasi promo memerlukan izin marketing:manage.</p>
      ) : (
        <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(360px,0.8fr)]">
          <section className="rounded-lg border bg-card p-4">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-semibold">Daftar notifikasi</h2>
                <p className="text-sm text-muted-foreground">Status pengiriman dan jadwal promo.</p>
              </div>
              <select className="h-9 rounded-md border bg-background px-3 text-sm" value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Filter status notifikasi">
                <option value="">Semua status</option><option value="DRAFT">Draft</option><option value="SCHEDULED">Terjadwal</option><option value="SENDING">Sedang dikirim</option><option value="SENT">Terkirim</option><option value="FAILED">Gagal</option>
              </select>
            </div>
            {query.isLoading ? <p className="rounded-md bg-muted/50 p-4 text-sm text-muted-foreground">Memuat notifikasi…</p> : query.isError ? <p role="alert" className="rounded-md border border-destructive/40 p-4 text-sm text-destructive">Daftar notifikasi tidak dapat dimuat. Coba muat ulang halaman.</p> : promos.length === 0 ? <p className="rounded-md bg-muted/50 p-4 text-sm text-muted-foreground">Belum ada notifikasi untuk filter ini.</p> : (
              <div className="grid gap-2">
                {promos.map((promo) => (
                  <article key={promo.id} className={`rounded-md border p-3 ${selected?.id === promo.id ? "border-primary bg-primary/5" : ""}`}>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <button type="button" className="min-w-0 flex-1 text-left" onClick={() => selectPromo(promo)}>
                        <span className="flex flex-wrap items-center gap-2 font-medium">{promo.nama}<span className={`rounded-full px-2 py-0.5 text-xs ${statusClass(promo.status)}`}>{statusLabel(promo.status)}</span></span>
                        <span className="mt-1 block truncate text-sm text-muted-foreground">{promo.title_id} · {promo.title_en}</span>
                        {promo.scheduled_at && <span className="mt-1 block text-xs text-muted-foreground">Jadwal: {new Date(promo.scheduled_at).toLocaleString("id-ID")}</span>}
                        {promo.status === "SENT" && <span className="mt-1 block text-xs text-muted-foreground">{promo.success_count} berhasil · {promo.failure_count} gagal</span>}
                        {promo.last_error && <span className="mt-1 block line-clamp-2 text-xs text-destructive">{promo.last_error}</span>}
                      </button>
                      <div className="flex shrink-0 flex-wrap gap-2">
                        {(promo.status === "DRAFT" || promo.status === "FAILED") && <Button size="sm" onClick={() => sendNow(promo)} disabled={mutationBusy}><Send className="size-3.5" />Kirim</Button>}
                        {promo.status === "SCHEDULED" && <Button size="sm" variant="outline" onClick={() => cancelSchedule.mutate({ params: { id: promo.id } })} disabled={mutationBusy}>Batalkan jadwal</Button>}
                        {(promo.status === "DRAFT" || promo.status === "FAILED") && <Button size="icon-sm" variant="ghost" aria-label={`Hapus ${promo.nama}`} onClick={() => { if (window.confirm(`Hapus draft “${promo.nama}”?`)) remove.mutate({ params: { id: promo.id } }); }} disabled={mutationBusy}><Trash2 className="size-4" /></Button>}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-lg border bg-card p-4">
            <div className="mb-4 flex items-start gap-3">
              <span className="grid size-10 place-items-center rounded-full bg-primary/10 text-primary"><BellRing className="size-5" /></span>
              <div><h2 className="font-semibold">{selected ? "Edit notifikasi" : "Konten notifikasi"}</h2><p className="text-sm text-muted-foreground">Isi kedua bahasa wajib dilengkapi.</p></div>
            </div>
            {!selectedEditable && <p role="status" className="mb-4 rounded-md bg-muted p-3 text-sm text-muted-foreground">Notifikasi yang sedang dikirim atau sudah terkirim tidak dapat diedit.</p>}
            <fieldset disabled={!selectedEditable || mutationBusy} className="grid gap-3 disabled:opacity-70">
              <label className="grid gap-1.5 text-sm font-medium">Nama internal<Input value={form.nama} onChange={(event) => setField("nama", event.target.value)} maxLength={120} placeholder="Contoh: Promo akhir pekan" /></label>
              <div className="grid gap-3 rounded-md border p-3">
                <p className="text-sm font-semibold">Bahasa Indonesia</p>
                <label className="grid gap-1.5 text-sm font-medium">Judul<Input value={form.title_id} onChange={(event) => setField("title_id", event.target.value)} maxLength={160} /></label>
                <label className="grid gap-1.5 text-sm font-medium">Isi<Textarea value={form.body_id} onChange={(event) => setField("body_id", event.target.value)} maxLength={2000} rows={3} /></label>
              </div>
              <div className="grid gap-3 rounded-md border p-3">
                <p className="text-sm font-semibold">English</p>
                <label className="grid gap-1.5 text-sm font-medium">Title<Input value={form.title_en} onChange={(event) => setField("title_en", event.target.value)} maxLength={160} /></label>
                <label className="grid gap-1.5 text-sm font-medium">Body<Textarea value={form.body_en} onChange={(event) => setField("body_en", event.target.value)} maxLength={2000} rows={3} /></label>
              </div>
              <label className="grid gap-1.5 text-sm font-medium">Path tujuan Store<Input value={form.deep_link} onChange={(event) => setField("deep_link", event.target.value)} maxLength={500} placeholder="/products atau /promotions" /><span className="text-xs font-normal text-muted-foreground">Masukkan path relatif; BE menambahkan locale buyer saat mengirim.</span></label>
              <label className="grid gap-1.5 text-sm font-medium">Jadwalkan pengiriman<Input type="datetime-local" value={form.scheduled_local} onChange={(event) => setField("scheduled_local", event.target.value)} /><span className="text-xs font-normal text-muted-foreground">Waktu mengikuti zona waktu browser ini.</span></label>
            </fieldset>
            <div className="mt-4 grid gap-3 rounded-md bg-muted/50 p-3">
              <div className="flex items-center gap-2 text-sm font-semibold"><CircleAlert className="size-4" />Pratinjau</div>
              <div><p className="text-xs font-semibold text-muted-foreground">ID</p><p className="text-sm font-medium">{preview.id}</p><p className="text-sm text-muted-foreground">{preview.body}</p></div>
              <div><p className="text-xs font-semibold text-muted-foreground">EN</p><p className="text-sm font-medium">{preview.en}</p><p className="text-sm text-muted-foreground">{preview.bodyEN}</p></div>
            </div>
            {selectedEditable && <div className="mt-4 flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => save(false)} disabled={mutationBusy}>{create.isPending || update.isPending ? "Menyimpan…" : "Simpan draft"}</Button>
              <Button onClick={() => save(true)} disabled={mutationBusy}><CalendarClock className="size-4" />Jadwalkan</Button>
              {selected && canDelete && <Button variant="ghost" onClick={() => { if (window.confirm(`Hapus draft “${selected.nama}”?`)) remove.mutate({ params: { id: selected.id } }); }} disabled={mutationBusy}><Trash2 className="size-4" />Hapus</Button>}
              {selected && selected.status === "SCHEDULED" && <Button variant="outline" onClick={() => cancelSchedule.mutate({ params: { id: selected.id } })} disabled={mutationBusy}>Batalkan jadwal</Button>}
              {selected && ["DRAFT", "FAILED"].includes(selected.status) && <Button onClick={() => sendNow(selected)} disabled={mutationBusy}><Send className="size-4" />Kirim sekarang</Button>}
            </div>}
          </section>
        </div>
      )}
    </section>
  );
}
