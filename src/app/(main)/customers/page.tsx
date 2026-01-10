import { MainContainer } from "@/components/container/main-container";
import { Metadata } from "next";
import { CustomersClient } from "./_components/client";
import { auth } from "@/lib/action/auth";
import { redirect } from "next/navigation";

const pathname = "customers";

export const metadata: Metadata = {
  title: "Pelanggan",
};

const CustomersPage = async () => {
  const isAuth = await auth();
  if (!isAuth) redirect(`/login?redirect=${encodeURIComponent(pathname)}`);

  return (
    <MainContainer breadcrumbs={[{ label: "Pelanggan" }]}>
      <CustomersClient />
    </MainContainer>
  );
};

export default CustomersPage;
