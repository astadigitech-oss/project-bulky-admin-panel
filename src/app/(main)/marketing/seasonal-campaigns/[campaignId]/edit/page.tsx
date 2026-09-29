import { MainContainer } from "@/components/container/main-container";
import { auth } from "@/lib/action/auth";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { EditSeasonalCampaignClient } from "./_components/client";

export const metadata: Metadata = { title: "Ubah Campaign Seasonal" };

export default async function EditSeasonalCampaignPage({
  params,
}: {
  params: Promise<{ campaignId: string }>;
}) {
  const { campaignId } = await params;
  if (!(await auth())) {
    redirect(
      `/login?redirect=${encodeURIComponent(`marketing/seasonal-campaigns/${campaignId}/edit`)}`,
    );
  }
  return (
    <MainContainer
      breadcrumbs={[
        { label: "Pemasaran", url: "/marketing" },
        { label: "Campaign Seasonal", url: "/marketing/seasonal-campaigns" },
        { label: "Ubah" },
      ]}
    >
      <EditSeasonalCampaignClient campaignId={campaignId} />
    </MainContainer>
  );
}
