import { MainContainer } from "@/components/container/main-container";
import { Metadata } from "next";
import { DashboardTransactionClient } from "./client";
import { auth } from "@/lib/action/auth";
import { redirect } from "next/navigation";

const pathname = "dashboard/transactions";

export const metadata: Metadata = {
  title: "Dasbor Transaksi",
};

const DashboardTransactionPage = async () => {
  const isAuth = await auth();
  if (!isAuth) redirect(`/login?redirect=${encodeURIComponent(pathname)}`);

  return (
    <MainContainer breadcrumbs={[{ label: "Dashbor" }, { label: "Transaksi" }]}>
      <DashboardTransactionClient />
    </MainContainer>
  );
};

export default DashboardTransactionPage;
