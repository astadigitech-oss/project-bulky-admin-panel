import { MainContainer } from "@/components/container/main-container";
import { Metadata } from "next";
import { DashboardTransactionClient } from "./client";

// const pathname = "dashboard/transactions";

export const metadata: Metadata = {
  title: "Dasbor Transaksi",
};

const DashboardTransactionPage = async () => {
  // if (!auth) redirect(`/login?redirect=${encodeURIComponent(pathname)}`);
  //

  return (
    <MainContainer breadcrumbs={[{ label: "Dashbor" }, { label: "Transaksi" }]}>
      <DashboardTransactionClient />
    </MainContainer>
  );
};

export default DashboardTransactionPage;
