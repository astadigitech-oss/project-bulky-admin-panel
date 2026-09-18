import { auth } from "@/lib/action/auth";
import { MainContainer } from "@/components/container/main-container";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuctionEducationBannerClient } from "./_components/client";

const pathname = "auctions/education-banners";
const labelPage = "Banner Edukasi Lelang";

export const metadata: Metadata = { title: labelPage };

export default async function AuctionEducationBannersPage() {
  const session = await auth();
  if (!session) redirect(`/login?redirect=${encodeURIComponent(pathname)}`);
  return (
    <MainContainer breadcrumbs={[{ label: "Lelang" }, { label: labelPage }]}>
      <AuctionEducationBannerClient />
    </MainContainer>
  );
}
