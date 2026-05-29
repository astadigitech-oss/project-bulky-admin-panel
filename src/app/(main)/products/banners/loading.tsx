import { MainContainer } from "@/components/container/main-container";
import { CenteredPageLoader } from "@/components/loaders/centered-page-loader";

const Loading = () => {
  return (
    <MainContainer
      breadcrumbs={[
        { label: "Produk", url: "/products/list" },
        { label: "Banner Jenis Produk" },
      ]}
    >
      <CenteredPageLoader label="Memuat banner jenis produk..." />
    </MainContainer>
  );
};

export default Loading;
