import { MainContainer } from "@/components/container/main-container";
import { Skeleton } from "@/components/ui/skeleton";

const Loading = () => {
  return (
    <MainContainer
      breadcrumbs={[
        { label: "Pengaturan" },
        { label: "Log Aktivitas", url: "/settings/activity-logs" },
        { label: "Detail" },
      ]}
    >
      <div className="pt-4">
        <Skeleton className="h-72 w-full" />
      </div>
    </MainContainer>
  );
};

export default Loading;
