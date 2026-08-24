import { MainContainer } from "@/components/container/main-container";
import { Metadata } from "next";
import { BackupClient } from "./_components/client";
import { auth } from "@/lib/action/auth";
import { redirect } from "next/navigation";

const pathname = "settings/backups";
const labelPage = "Backup Database";

export const metadata: Metadata = {
  title: labelPage,
};

const BackupPage = async () => {
  const isAuth = await auth();
  if (!isAuth) redirect(`/login?redirect=${encodeURIComponent(pathname)}`);

  return (
    <MainContainer
      breadcrumbs={[{ label: "Pengaturan" }, { label: labelPage }]}
    >
      <BackupClient />
    </MainContainer>
  );
};

export default BackupPage;
