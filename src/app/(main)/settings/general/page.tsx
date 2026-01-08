import { MainContainer } from "@/components/container/main-container";
import { Metadata } from "next";
import { GeneralSettingsClient } from "./_components/client";
import { auth } from "@/lib/action/auth";
import { redirect } from "next/navigation";

const pathname = "settings/general";
const labelPage = "Umum";

export const metadata: Metadata = {
  title: labelPage,
};

const SettingsGeneralPage = async () => {
  const isAuth = await auth();
  if (!isAuth) redirect(`/login?redirect=${encodeURIComponent(pathname)}`);

  return (
    <MainContainer
      breadcrumbs={[{ label: "Pengaturan" }, { label: labelPage }]}
    >
      <GeneralSettingsClient />
    </MainContainer>
  );
};

export default SettingsGeneralPage;
