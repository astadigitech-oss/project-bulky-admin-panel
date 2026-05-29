import { MainContainer } from "@/components/container/main-container";
import { Metadata } from "next";
import { auth } from "@/lib/action/auth";
import { redirect } from "next/navigation";
import { ActivityLogDetailClient } from "./_components/client";

const pathname = "settings/activity-logs";
const labelPage = "Detail Log Aktivitas";

export const metadata: Metadata = {
  title: labelPage,
};

const ActivityLogDetailPage = async ({
  params,
}: {
  params: Promise<{ activityLogId: string }>;
}) => {
  const isAuth = await auth();
  if (!isAuth) redirect(`/login?redirect=${encodeURIComponent(pathname)}`);

  const { activityLogId } = await params;

  return (
    <MainContainer
      breadcrumbs={[
        { label: "Pengaturan" },
        { label: "Log Aktivitas", url: "/settings/activity-logs" },
        { label: "Detail" },
      ]}
    >
      <div className="pt-4">
        <ActivityLogDetailClient activityLogId={activityLogId} />
      </div>
    </MainContainer>
  );
};

export default ActivityLogDetailPage;
