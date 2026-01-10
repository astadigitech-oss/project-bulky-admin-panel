import { MainContainer } from "@/components/container/main-container";
import { Metadata } from "next";
import { CustomerDetailClient } from "./_components/client";
import { redirect } from "next/navigation";
import { auth } from "@/lib/action/auth";

const pathname = "customers";

export const metadata: Metadata = {
  title: "Detail Pelanggan",
};

const CustomerDetailPage = async () => {
  const isAuth = await auth();
  if (!isAuth) redirect(`/login?redirect=${encodeURIComponent(pathname)}`);

  return (
    <MainContainer
      breadcrumbs={[
        { label: "Pelanggan", url: `/${pathname}` },
        { label: "Detail" },
      ]}
    >
      <CustomerDetailClient />
    </MainContainer>
  );
};

export default CustomerDetailPage;
