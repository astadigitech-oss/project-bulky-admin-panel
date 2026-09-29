import { MainContainer } from "@/components/container/main-container";
import { auth } from "@/lib/action/auth";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { Info } from "lucide-react";
import { SeasonalCampaignClient } from "./_components/client";

const pathname = "marketing/seasonal-campaigns";
const labelPage = "Campaign Seasonal";

export const metadata: Metadata = { title: labelPage };

export default async function SeasonalCampaignPage() {
  if (!(await auth())) redirect(`/login?redirect=${encodeURIComponent(pathname)}`);
  return (
    <MainContainer breadcrumbs={[{ label: "Pemasaran" }, { label: labelPage }]}>
      <div
        role="status"
        className="mb-4 flex items-start gap-2 rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-700 dark:border-blue-300/30 dark:bg-blue-400/10 dark:text-blue-200"
      >
        <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
        <p>Fitur Campaign Seasonal belum dapat digunakan, karena masih dalam tahap pengembangan.</p>
      </div>
      <SeasonalCampaignClient />
    </MainContainer>
  );
}
