import { MainContainer } from "@/components/container/main-container";
import { auth } from "@/lib/action/auth";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { MaintenanceSettingsClient } from "./_components/client";

const pathname = "settings/maintenance";
const labelPage = "Maintenance";

export const metadata: Metadata = {
  title: labelPage,
};

const MaintenanceSettingsPage = async () => {
  const isAuth = auth();
  if (!isAuth) redirect(`/login?redirect=${encodeURIComponent(pathname)}`);

  return (
    <MainContainer
      breadcrumbs={[{ label: "Pengaturan" }, { label: labelPage }]}
    >
      <MaintenanceSettingsClient />
    </MainContainer>
  );
};

export default MaintenanceSettingsPage;
