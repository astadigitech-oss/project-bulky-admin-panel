import { MainContainer } from "@/components/container/main-container";
import { Metadata } from "next";

// const pathname = "products/banners";
const labelPage = "Banner Tipe Produk";

export const metadata: Metadata = {
  title: labelPage,
};

const ProductBannersPage = async () => {
  // if (!auth) redirect(`/login?redirect=${encodeURIComponent(pathname)}`);

  return (
    <MainContainer
      breadcrumbs={[
        { label: "Produk", url: "/products/list" },
        { label: labelPage },
      ]}
    >
      <div className="h-[200vh] bg-gray-400 rounded-md"></div>
    </MainContainer>
  );
};

export default ProductBannersPage;
