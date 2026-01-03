import { MainContainer } from "@/components/container/main-container";
import { Metadata } from "next";
import { GeneralSettingsClient } from "./_components/client";

// const pathname = "settings/general";
const labelPage = "Umum";

export const metadata: Metadata = {
  title: labelPage,
};

const SettingsGeneralPage = async () => {
  // if (!auth) redirect(`/login?redirect=${encodeURIComponent(pathname)}`);

  return (
    <MainContainer
      breadcrumbs={[{ label: "Pengaturan" }, { label: labelPage }]}
    >
      <GeneralSettingsClient />
    </MainContainer>
  );
};

export default SettingsGeneralPage;
