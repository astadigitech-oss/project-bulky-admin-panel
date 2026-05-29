import { MainContainer } from "@/components/container/main-container";
import { CenteredPageLoader } from "@/components/loaders/centered-page-loader";

const Loading = () => {
  return (
    <MainContainer
      breadcrumbs={[{ label: "Dashboard" }, { label: "Transaksi" }]}
    >
      <CenteredPageLoader label="Memuat transaksi..." />
    </MainContainer>
  );
};

export default Loading;
