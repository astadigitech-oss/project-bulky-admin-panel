import { MainContainer } from "@/components/container/main-container";
import { Metadata } from "next";
import { PackageConditionProductClient } from "./_components/client";
import { auth } from "@/lib/action/auth";
import { redirect } from "next/navigation";

const pathname = "products/conditions/package";
const labelPage = "Kondisi Paket";

export const metadata: Metadata = {
  title: labelPage,
};

const PackageConditionPage = async () => {
  const isAuth = await auth();
  if (!isAuth) redirect(`/login?redirect=${encodeURIComponent(pathname)}`);

  return (
    <MainContainer
      breadcrumbs={[
        { label: "Produk", url: "/products/list" },
        { label: labelPage },
      ]}
    >
      <PackageConditionProductClient />
    </MainContainer>
  );
};

export default PackageConditionPage;
