import { MainContainer } from "@/components/container/main-container";
import { Metadata } from "next";
import { StaffSettingsClient } from "./_components/client";

// const pathname = "settings/staff";
const labelPage = "Staff";

export const metadata: Metadata = {
  title: labelPage,
};

const StaffPage = async () => {
  // if (!auth) redirect(`/login?redirect=${encodeURIComponent(pathname)}`);

  return (
    <MainContainer
      breadcrumbs={[{ label: "Pengaturan" }, { label: labelPage }]}
    >
      <StaffSettingsClient />
    </MainContainer>
  );
};

export default StaffPage;
