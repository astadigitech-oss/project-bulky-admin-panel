import { MainContainer } from "@/components/container/main-container";
import { Metadata } from "next";

// const pathname = "products/sources";

export const metadata: Metadata = {
  title: "Sumber Produk",
};

const ProductSourcesPage = async () => {
  // if (!auth) redirect(`/login?redirect=${encodeURIComponent(pathname)}`);

  return (
    <MainContainer
      breadcrumbs={[
        { label: "Produk", url: "/products/list" },
        { label: "Sumber" },
      ]}
    >
      <div className="h-[200vh] bg-gray-400 rounded-md"></div>
    </MainContainer>
  );
};

export default ProductSourcesPage;
