import { MainContainer } from "@/components/container/main-container";
import { Metadata } from "next";
import { StaffSettingsClient } from "./_components/client";
import { auth } from "@/lib/action/auth";
import { redirect } from "next/navigation";

const pathname = "settings/staff";
const labelPage = "Staff";

export const metadata: Metadata = {
  title: labelPage,
};

const StaffPage = async () => {
  const isAuth = await auth();
  if (!isAuth) redirect(`/login?redirect=${encodeURIComponent(pathname)}`);

  return (
    <MainContainer
      breadcrumbs={[{ label: "Pengaturan" }, { label: labelPage }]}
    >
      <StaffSettingsClient />
    </MainContainer>
  );
};

export default StaffPage;
