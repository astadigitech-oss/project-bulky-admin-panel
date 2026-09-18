import { MainContainer } from "@/components/container/main-container";
import { auth } from "@/lib/action/auth";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuctionListClient } from "./_components/client";

const pathname = "auctions/list";

export const metadata: Metadata = {
  title: "Lelang",
};

const AuctionListPage = async () => {
  const isAuth = await auth();
  if (!isAuth) redirect(`/login?redirect=${encodeURIComponent(pathname)}`);

  return (
    <MainContainer breadcrumbs={[{ label: "Lelang" }, { label: "Daftar" }]}>
      <AuctionListClient />
    </MainContainer>
  );
};

export default AuctionListPage;
