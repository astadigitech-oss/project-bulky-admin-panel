import { MainContainer } from "@/components/container/main-container";
import { CenteredPageLoader } from "@/components/loaders/centered-page-loader";

const Loading = () => {
  return (
    <MainContainer
      breadcrumbs={[
        { label: "Pengaturan" },
        { label: "Log Aktivitas", url: "/settings/activity-logs" },
        { label: "Detail" },
      ]}
    >
      <CenteredPageLoader label="Memuat detail log aktivitas..." />
    </MainContainer>
  );
};

export default Loading;
