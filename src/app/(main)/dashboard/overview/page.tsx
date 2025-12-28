import { MainContainer } from "@/components/container/main-container";
import { Metadata } from "next";

// const pathname = "dashboard/overview";

export const metadata: Metadata = {
  title: "Ringkasan Dasbor",
};

const DashboardOverviewPage = async () => {
  // if (!auth) redirect(`/login?redirect=${encodeURIComponent(pathname)}`);

  return (
    <MainContainer breadcrumbs={[{ label: "Dashbor" }, { label: "Ringkasan" }]}>
      <div className="h-[200vh] bg-gray-400 rounded-md"></div>
    </MainContainer>
  );
};

export default DashboardOverviewPage;
