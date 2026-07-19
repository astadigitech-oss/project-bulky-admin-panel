"use client";

import { useGetDisclaimerConsentDetail } from "@/app/(main)/orders/disclaimer-consent/_api";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { Globe, Monitor, ShieldCheck, User } from "lucide-react";

export const DisclaimerConsentDetailClient = ({
  consentId,
}: {
  consentId: string;
}) => {
  const { data, isLoading } = useGetDisclaimerConsentDetail({ id: consentId });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-sm text-muted-foreground">
        Memuat detail persetujuan disclaimer...
      </div>
    );
  }

  if (!data?.data) {
    return (
      <div className="flex items-center justify-center h-64 text-sm text-muted-foreground">
        Data persetujuan disclaimer tidak ditemukan.
      </div>
    );
  }

  const consent = data.data;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="leading-none font-semibold text-2xl">
        Detail Persetujuan Disclaimer
      </h1>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Informasi Pesanan */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <ShieldCheck className="size-4" />
              Informasi Persetujuan
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm">
            <div className="flex justify-between gap-2">
              <span className="text-muted-foreground">No. Pesanan</span>
              <span className="font-medium">{consent.pesanan_kode}</span>
            </div>
            <Separator />
            <div className="flex justify-between gap-2">
              <span className="text-muted-foreground">Disetujui Pada</span>
              <span className="font-medium">
                {format(
                  new Date(consent.disetujui_at),
                  "dd MMM yyyy, HH:mm 'WIB'",
                )}
              </span>
            </div>
            <Separator />
            <div className="flex justify-between gap-2">
              <span className="text-muted-foreground">Dibuat Pada</span>
              <span className="font-medium">
                {format(
                  new Date(consent.created_at),
                  "dd MMM yyyy, HH:mm 'WIB'",
                )}
              </span>
            </div>
            <Separator />
            <div className="flex justify-between gap-2">
              <span className="text-muted-foreground">ID Disclaimer</span>
              <Badge variant="outline" className="font-mono text-xs">
                {consent.disclaimer_id}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Informasi Pembeli */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="size-4" />
              Informasi Pembeli
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm">
            <div className="flex justify-between gap-2">
              <span className="text-muted-foreground">Nama</span>
              <span className="font-medium">{consent.buyer_nama}</span>
            </div>
            <Separator />
            <div className="flex justify-between gap-2">
              <span className="text-muted-foreground">Email</span>
              <span className="font-medium">
                {consent.buyer_email || (
                  <span className="text-muted-foreground italic">
                    — (OAuth tanpa email)
                  </span>
                )}
              </span>
            </div>
            <Separator />
            <div className="flex justify-between gap-2">
              <span className="text-muted-foreground">ID Pembeli</span>
              <Badge variant="outline" className="font-mono text-xs">
                {consent.buyer_id}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Informasi Teknis */}
        <Card className="md:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Globe className="size-4" />
              Informasi Teknis
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm">
            <div className="flex justify-between gap-2">
              <span className="text-muted-foreground shrink-0">IP Address</span>
              <span className="font-medium font-mono">
                {consent.ip_address ?? (
                  <span className="text-muted-foreground italic font-sans">
                    — (tidak tersedia)
                  </span>
                )}
              </span>
            </div>
            <Separator />
            <div className="flex flex-col gap-1.5">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <Monitor className="size-3.5" />
                User Agent
              </span>
              <span className="font-mono text-xs break-all rounded-md bg-muted px-3 py-2">
                {consent.user_agent ?? (
                  <span className="text-muted-foreground italic font-sans text-sm">
                    — (tidak tersedia)
                  </span>
                )}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
