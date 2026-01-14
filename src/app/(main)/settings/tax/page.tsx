import { MainContainer } from "@/components/container/main-container";
import { Metadata } from "next";
import { TaxSettingsClient } from "./_components/client";
import { auth } from "@/lib/action/auth";
import { redirect } from "next/navigation";

const pathname = "settings/tax";
const labelPage = "Pajak";

export const metadata: Metadata = {
  title: labelPage,
};

const TaxPage = async () => {
  const isAuth = await auth();
  if (!isAuth) redirect(`/login?redirect=${encodeURIComponent(pathname)}`);

  return (
    <MainContainer
      breadcrumbs={[{ label: "Pengaturan" }, { label: labelPage }]}
    >
      <TaxSettingsClient />
    </MainContainer>
  );
};

export default TaxPage;
