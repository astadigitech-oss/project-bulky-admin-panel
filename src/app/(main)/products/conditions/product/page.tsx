import { MainContainer } from "@/components/container/main-container";
import { Metadata } from "next";
import { ProductConditionClient } from "./_components/client";
import { auth } from "@/lib/action/auth";
import { redirect } from "next/navigation";

const pathname = "products/conditions/product";
const labelPage = "KOndisi Produk";

export const metadata: Metadata = {
  title: labelPage,
};

const ConditionProductPage = async () => {
  const isAuth = await auth();
  if (!isAuth) redirect(`/login?redirect=${encodeURIComponent(pathname)}`);

  return (
    <MainContainer
      breadcrumbs={[
        { label: "Produk", url: "/products/list" },
        { label: labelPage },
      ]}
    >
      <ProductConditionClient />
    </MainContainer>
  );
};

export default ConditionProductPage;
