import { MainContainer } from "@/components/container/main-container";
import { Metadata } from "next";
import { SourceProductClient } from "./_components/client";
import { auth } from "@/lib/action/auth";
import { redirect } from "next/navigation";

const pathname = "products/sources";
const labelPage = "Sumber";

export const metadata: Metadata = {
  title: `${labelPage} Produk`,
};

const ProductSourcesPage = async () => {
  const isAuth = await auth();
  if (!isAuth) redirect(`/login?redirect=${encodeURIComponent(pathname)}`);

  return (
    <MainContainer
      breadcrumbs={[
        { label: "Produk", url: "/products/list" },
        { label: labelPage },
      ]}
    >
      <SourceProductClient />
    </MainContainer>
  );
};

export default ProductSourcesPage;
