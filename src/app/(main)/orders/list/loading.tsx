import { MainContainer } from "@/components/container/main-container";
import { CenteredPageLoader } from "@/components/loaders/centered-page-loader";

const Loading = () => {
  return (
    <MainContainer breadcrumbs={[{ label: "Pesanan" }]}>
      <CenteredPageLoader label="Memuat daftar pesanan..." />
    </MainContainer>
  );
};

export default Loading;
