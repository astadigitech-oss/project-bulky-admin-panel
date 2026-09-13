import { MainContainer } from "@/components/container/main-container";
import { auth } from "@/lib/action/auth";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { SeasonalCampaignClient } from "./_components/client";

const pathname = "marketing/seasonal-campaigns";
const labelPage = "Campaign Seasonal";

export const metadata: Metadata = { title: labelPage };

export default async function SeasonalCampaignPage() {
  if (!(await auth())) redirect(`/login?redirect=${encodeURIComponent(pathname)}`);
  return (
    <MainContainer breadcrumbs={[{ label: "Pemasaran" }, { label: labelPage }]}>
      <SeasonalCampaignClient />
    </MainContainer>
  );
}
