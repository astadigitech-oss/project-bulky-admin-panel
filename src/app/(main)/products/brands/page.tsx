import { MainContainer } from "@/components/container/main-container";
import { Metadata } from "next";
import { BrandProductClient } from "./_components/client";
import { auth } from "@/lib/action/auth";
import { redirect } from "next/navigation";

const pathname = "products/brands";
const labelPage = "Merek";

export const metadata: Metadata = {
  title: `${labelPage} Produk`,
};

const ProductBrandPage = async () => {
  const isAuth = await auth();
  if (!isAuth) redirect(`/login?redirect=${encodeURIComponent(pathname)}`);

  return (
    <MainContainer
      breadcrumbs={[
        { label: "Produk", url: "/products/list" },
        { label: labelPage },
      ]}
    >
      <BrandProductClient />
    </MainContainer>
  );
};

export default ProductBrandPage;
