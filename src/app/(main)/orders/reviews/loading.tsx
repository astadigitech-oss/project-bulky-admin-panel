import { MainContainer } from "@/components/container/main-container";
import { CenteredPageLoader } from "@/components/loaders/centered-page-loader";

const Loading = () => {
  return (
    <MainContainer
      breadcrumbs={[
        { label: "Pesanan", url: "/orders/list" },
        { label: "Ulasan" },
      ]}
    >
      <CenteredPageLoader label="Memuat ulasan pesanan..." />
    </MainContainer>
  );
};

export default Loading;
