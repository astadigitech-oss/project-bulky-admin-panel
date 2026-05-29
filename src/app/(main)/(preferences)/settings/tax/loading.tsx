import { MainContainer } from "@/components/container/main-container";
import { CenteredPageLoader } from "@/components/loaders/centered-page-loader";

const Loading = () => {
  return (
    <MainContainer breadcrumbs={[{ label: "Pengaturan" }, { label: "Pajak" }]}>
      <CenteredPageLoader label="Memuat data pajak..." />
    </MainContainer>
  );
};

export default Loading;
