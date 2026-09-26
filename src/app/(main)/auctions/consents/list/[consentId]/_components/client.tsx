"use client";

import { format } from "date-fns";
import type { ReactNode } from "react";
import { Globe, Monitor, ShieldCheck, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useGetPersetujuanSyaratLelangDetail } from "@/app/(main)/auctions/consents/_api";

function InfoRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex justify-between gap-3 text-sm">
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}

export function PersetujuanSyaratLelangDetailClient({ consentId }: { consentId: string }) {
  const { data, isLoading } = useGetPersetujuanSyaratLelangDetail({ id: consentId });

  if (isLoading) {
    return <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">Memuat detail persetujuan SK lelang...</div>;
  }
  if (!data?.data) {
    return <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">Data persetujuan SK lelang tidak ditemukan.</div>;
  }

  const consent = data.data;
  const formatDate = (value: string) => format(new Date(value), "dd MMM yyyy, HH:mm 'WIB'");

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl leading-none font-semibold">Detail Persetujuan SK Lelang</h1>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-base"><ShieldCheck className="size-4" />Informasi Persetujuan</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-3">
            <InfoRow label="Batch" value={`${consent.batch_kode} · ${consent.batch_nama}`} />
            <Separator />
            <InfoRow label="Bid ke-" value={consent.bid_sequence} />
            <Separator />
            <InfoRow label="Nominal Bid" value={consent.bid_amount} />
            <Separator />
            <InfoRow label="Disetujui Pada" value={formatDate(consent.disetujui_at)} />
            <Separator />
            <InfoRow label="Versi Bahasa" value={consent.locale.toUpperCase()} />
            <Separator />
            <InfoRow label="Dokumen SK" value={<Badge variant="outline" className="font-mono text-xs">{consent.terms_document_id}</Badge>} />
            <Separator />
            <InfoRow label="Hash Konten" value={<span className="max-w-xs break-all font-mono text-xs">{consent.content_hash}</span>} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-base"><User className="size-4" />Informasi Pembeli</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-3">
            <InfoRow label="Nama" value={consent.buyer_nama} />
            <Separator />
            <InfoRow label="Email" value={consent.buyer_email || "—"} />
            <Separator />
            <InfoRow label="ID Pembeli" value={<Badge variant="outline" className="font-mono text-xs">{consent.buyer_id}</Badge>} />
            <Separator />
            <InfoRow label="ID Bid" value={<Badge variant="outline" className="font-mono text-xs">{consent.bid_id}</Badge>} />
          </CardContent>
        </Card>
        <Card className="md:col-span-2">
          <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-base"><Globe className="size-4" />Informasi Teknis</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-3">
            <InfoRow label="IP Address" value={<span className="font-mono">{consent.ip_address || "— (tidak tersedia)"}</span>} />
            <Separator />
            <div className="flex flex-col gap-1.5 text-sm">
              <span className="flex items-center gap-1.5 text-muted-foreground"><Monitor className="size-3.5" />User Agent</span>
              <span className="break-all rounded-md bg-muted px-3 py-2 font-mono text-xs">{consent.user_agent || "— (tidak tersedia)"}</span>
            </div>
            <Separator />
            <InfoRow label="Dibuat Pada" value={formatDate(consent.created_at)} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
