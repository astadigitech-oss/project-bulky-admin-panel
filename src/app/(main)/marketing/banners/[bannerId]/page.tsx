import { MainContainer } from "@/components/container/main-container";
import { Metadata } from "next";
import { BannerDetailClient } from "./_components/client";
import { redirect } from "next/navigation";
import { auth } from "@/lib/action/auth";

const pathname = "marketing/banners";

export const metadata: Metadata = {
  title: "Detail Pelanggan",
};

const BannerDetailPage = async () => {
  const isAuth = await auth();
  if (!isAuth) redirect(`/login?redirect=${encodeURIComponent(pathname)}`);

  return (
    <MainContainer
      breadcrumbs={[
        { label: "Pemasaran" },
        { label: "Banner Promosi", url: `/${pathname}` },
        { label: "Detail" },
      ]}
    >
      <BannerDetailClient />
    </MainContainer>
  );
};

export default BannerDetailPage;
