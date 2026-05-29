import { MainContainer } from "@/components/container/main-container";
import { Metadata } from "next";
import { auth } from "@/lib/action/auth";
import { redirect } from "next/navigation";
import { ActivityLogClient } from "./_components/client";

const pathname = "settings/activity-logs";
const labelPage = "Log Aktivitas";

export const metadata: Metadata = {
  title: labelPage,
};

const ActivityLogPage = async () => {
  const isAuth = await auth();
  if (!isAuth) redirect(`/login?redirect=${encodeURIComponent(pathname)}`);

  return (
    <MainContainer breadcrumbs={[{ label: "Pengaturan" }, { label: labelPage }]}>
      <ActivityLogClient />
    </MainContainer>
  );
};

export default ActivityLogPage;
