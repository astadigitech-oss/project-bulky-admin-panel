import { MainContainer } from "@/components/container/main-container";
import { auth } from "@/lib/action/auth";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { ProductIdClient } from "./_components/client";

const pathname = "products/list";

export const metadata: Metadata = {
  title: "Produk",
};

const ProductListPage = async () => {
  const isAuth = await auth();
  if (!isAuth) redirect(`/login?redirect=${encodeURIComponent(pathname)}`);

  return (
    <MainContainer
      breadcrumbs={[
        { label: "Produk", url: "/products/list" },
        { label: "Tambah" },
      ]}
    >
      <ProductIdClient />
    </MainContainer>
  );
};

export default ProductListPage;
