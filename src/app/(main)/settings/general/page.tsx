import { MainContainer } from "@/components/container/main-container";
import { Metadata } from "next";

// const pathname = "policies/general";
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
      <div className="h-[200vh] bg-gray-400 rounded-md"></div>
    </MainContainer>
  );
};

export default SettingsGeneralPage;
