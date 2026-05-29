import { MainContainer } from "@/components/container/main-container";
import { Metadata } from "next";
import { auth } from "@/lib/action/auth";
import { redirect } from "next/navigation";
import { DashboardOverviewClient } from "./_components/client";

const pathname = "dashboard/overview";

export const metadata: Metadata = {
  title: "Ringkasan Dasbor",
};

const DashboardOverviewPage = async () => {
  const isAuth = await auth();
  if (!isAuth) redirect(`/login?redirect=${encodeURIComponent(pathname)}`);

  return (
    <MainContainer breadcrumbs={[{ label: "Dashbor" }, { label: "Ringkasan" }]}>
      <DashboardOverviewClient />
    </MainContainer>
  );
};

export default DashboardOverviewPage;
