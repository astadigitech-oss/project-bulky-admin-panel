import { MainContainer } from "@/components/container/main-container";
import { Metadata } from "next";
import { PersetujuanSyaratLelangDetailClient } from "./_components/client";

export const metadata: Metadata = { title: "Detail Persetujuan SK Lelang" };

export default async function PersetujuanSyaratLelangDetailPage({
  params,
}: {
  params: Promise<{ consentId: string }>;
}) {
  const { consentId } = await params;
  const listPath = "/auctions/consents/list";

  return (
    <MainContainer breadcrumbs={[{ label: "Lelang" }, { label: "Persetujuan SK Lelang", url: listPath }, { label: "Detail" }]}>
      <PersetujuanSyaratLelangDetailClient consentId={consentId} />
    </MainContainer>
  );
}
