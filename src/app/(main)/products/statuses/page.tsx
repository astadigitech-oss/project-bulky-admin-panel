import { MainContainer } from "@/components/container/main-container";
import { Metadata } from "next";

// const pathname = "products/statuses";

export const metadata: Metadata = {
  title: "Status Produk",
};

const ProductStatusesPage = async () => {
  // if (!auth) redirect(`/login?redirect=${encodeURIComponent(pathname)}`);

  return (
    <MainContainer
      breadcrumbs={[
        { label: "Produk", url: "/products/list" },
        { label: "Status" },
      ]}
    >
      <div className="h-[200vh] bg-gray-400 rounded-md"></div>
    </MainContainer>
  );
};

export default ProductStatusesPage;
