import { MainContainer } from "@/components/container/main-container";
import { auth } from "@/lib/action/auth";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { ForceUpdateSettingsClient } from "./_components/client";

const pathname = "operationals/force-update";
const labelPage = "Force Update";

export const metadata: Metadata = {
  title: labelPage,
};

const ForceUpdateSettingsPage = async () => {
  const isAuth = auth();
  if (!isAuth) redirect(`/login?redirect=${encodeURIComponent(pathname)}`);

  return (
    <MainContainer
      breadcrumbs={[{ label: "Operasional" }, { label: labelPage }]}
    >
      <ForceUpdateSettingsClient />
    </MainContainer>
  );
};

export default ForceUpdateSettingsPage;
