import { MainContainer } from "@/components/container/main-container";
import { CenteredPageLoader } from "@/components/loaders/centered-page-loader";

const label = "Log Aktivitas";

const Loading = () => {
  return (
    <MainContainer breadcrumbs={[{ label: "Pengaturan" }, { label }]}>
      <CenteredPageLoader label="Memuat log aktivitas..." />
    </MainContainer>
  );
};

export default Loading;
