import { MainContainer } from "@/components/container/main-container";
import { CenteredPageLoader } from "@/components/loaders/centered-page-loader";

const Loading = () => {
  return (
    <MainContainer breadcrumbs={[{ label: "Pengaturan" }, { label: "Backup Database" }]}>
      <CenteredPageLoader label="Memuat data backup database..." />
    </MainContainer>
  );
};

export default Loading;
