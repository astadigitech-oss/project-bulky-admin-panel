import { MainContainer } from "@/components/container/main-container";
import { Metadata } from "next";

// const pathname = "products/conditions/package";
const labelPage = "KOndisi Paket";

export const metadata: Metadata = {
  title: labelPage,
};

const PackageConditionPage = async () => {
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

export default PackageConditionPage;
