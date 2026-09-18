import { MainContainer } from "@/components/container/main-container";
import { auth } from "@/lib/action/auth";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { BatchForm } from "./_components/batch-form";

const pathname = "auctions/create";

export const metadata: Metadata = {
  title: "Buat Batch Lelang",
};

const AuctionCreatePage = async () => {
  const isAuth = await auth();
  if (!isAuth) redirect(`/login?redirect=${encodeURIComponent(pathname)}`);

  return (
    <MainContainer
      breadcrumbs={[
        { label: "Lelang" },
        { label: "Daftar", url: "/auctions/list" },
        { label: "Buat Batch" },
      ]}
    >
      <BatchForm />
    </MainContainer>
  );
};

export default AuctionCreatePage;
