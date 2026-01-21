import { MainContainer } from "@/components/container/main-container";
import { Metadata } from "next";
import { BannerMarketingClient } from "./_components/client";
import { redirect } from "next/navigation";
import { auth } from "@/lib/action/auth";

const pathname = "marketing/banners";
const labelPage = "Banner Promosi";

export const metadata: Metadata = {
  title: labelPage,
};

const MarketingBannerPage = async () => {
  const isAuth = await auth();
  if (!isAuth) redirect(`/login?redirect=${encodeURIComponent(pathname)}`);

  return (
    <MainContainer breadcrumbs={[{ label: "Pemasaran" }, { label: labelPage }]}>
      <BannerMarketingClient />
    </MainContainer>
  );
};

export default MarketingBannerPage;
