import { MainContainer } from "@/components/container/main-container";
import { auth } from "@/lib/action/auth";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { BannerTypeProductClient } from "./_components/client";

const pathname = "products/banners";
const labelPage = "Banner Jenis Produk";

export const metadata: Metadata = {
  title: labelPage,
};

const ProductBannersPage = async () => {
  const isAuth = await auth();
  if (!isAuth) redirect(`/login?redirect=${encodeURIComponent(pathname)}`);

  return (
    <MainContainer
      breadcrumbs={[
        { label: "Produk", url: "/products/list" },
        { label: labelPage },
      ]}
    >
      <BannerTypeProductClient />
    </MainContainer>
  );
};

export default ProductBannersPage;
