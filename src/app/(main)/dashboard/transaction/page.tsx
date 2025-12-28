import { MainContainer } from "@/components/container/main-container";
import { Metadata } from "next";

// const pathname = "dashboard/transactions";

export const metadata: Metadata = {
  title: "Dasbor Transaksi",
};

const DashboardTransactionPage = async () => {
  // if (!auth) redirect(`/login?redirect=${encodeURIComponent(pathname)}`);

  return (
    <MainContainer breadcrumbs={[{ label: "Dashbor" }, { label: "Transaksi" }]}>
      <div className="h-[200vh] bg-gray-400 rounded-md"></div>
    </MainContainer>
  );
};

export default DashboardTransactionPage;
