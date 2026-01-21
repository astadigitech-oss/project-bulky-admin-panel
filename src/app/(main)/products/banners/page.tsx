import { MainContainer } from "@/components/container/main-container";
import { auth } from "@/lib/action/auth";
import { Metadata } from "next";
import { redirect } from "next/navigation";

const pathname = "products/banners";
const labelPage = "Banner Tipe Produk";

export const metadata: Metadata = {
  title: labelPage,
};

const ProductBannersPage = async () => {
  const isAuth = auth();
  if (!isAuth) redirect(`/login?redirect=${encodeURIComponent(pathname)}`);

  return (
    <MainContainer
      breadcrumbs={[
        { label: "Produk", url: "/products/list" },
        { label: labelPage },
      ]}
    >
      <div></div>
    </MainContainer>
  );
};

export default ProductBannersPage;
