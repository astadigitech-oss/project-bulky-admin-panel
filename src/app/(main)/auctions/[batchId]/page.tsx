import { MainContainer } from "@/components/container/main-container";
import { auth } from "@/lib/action/auth";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuctionDetailClient } from "./_components/detail-client";

const pathname = "auctions/[batchId]";

export const metadata: Metadata = {
  title: "Detail Batch Lelang",
};

const AuctionDetailPage = async ({
  params,
}: {
  params: Promise<{ batchId: string }>;
}) => {
  const isAuth = await auth();
  if (!isAuth) redirect(`/login?redirect=${encodeURIComponent(pathname)}`);

  const { batchId } = await params;

  return (
    <MainContainer
      breadcrumbs={[
        { label: "Lelang" },
        { label: "Daftar", url: "/auctions/list" },
        { label: batchId },
      ]}
    >
      <AuctionDetailClient batchId={batchId} />
    </MainContainer>
  );
};

export default AuctionDetailPage;
