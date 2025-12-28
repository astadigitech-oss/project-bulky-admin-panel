import { MainContainer } from "@/components/container/main-container";
import { Metadata } from "next";

// const pathname = "marketing/wholesaler";
const labelPage = "Formulir Grosir";

export const metadata: Metadata = {
  title: labelPage,
};

const WholesalerFormPage = async () => {
  // if (!auth) redirect(`/login?redirect=${encodeURIComponent(pathname)}`);

  return (
    <MainContainer breadcrumbs={[{ label: "Pemasaran" }, { label: labelPage }]}>
      <div className="h-[200vh] bg-gray-400 rounded-md"></div>
    </MainContainer>
  );
};

export default WholesalerFormPage;
