import { MainContainer } from "@/components/container/main-container";
import { Metadata } from "next";
import { Suspense } from "react";
import { PersetujuanSyaratLelangListClient } from "./_components/client";

const labelPage = "Persetujuan SK Lelang";

export const metadata: Metadata = { title: labelPage };

export default function PersetujuanSyaratLelangListPage() {
  return (
    <MainContainer breadcrumbs={[{ label: "Lelang" }, { label: labelPage }]}>
      <Suspense fallback={<div className="flex h-64 items-center justify-center text-sm text-muted-foreground">Memuat persetujuan SK lelang...</div>}>
        <PersetujuanSyaratLelangListClient />
      </Suspense>
    </MainContainer>
  );
}
