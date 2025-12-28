import { MainContainer } from "@/components/container/main-container";
import { Metadata } from "next";

// const pathname = "products/list";

export const metadata: Metadata = {
  title: "Produk",
};

const ProductListPage = async () => {
  // if (!auth) redirect(`/login?redirect=${encodeURIComponent(pathname)}`);

  return (
    <MainContainer breadcrumbs={[{ label: "Produk" }]}>
      <div className="h-[200vh] bg-gray-400 rounded-md"></div>
    </MainContainer>
  );
};

export default ProductListPage;
