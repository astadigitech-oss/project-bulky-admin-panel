import { MainContainer } from "@/components/container/main-container";
import { Metadata } from "next";

// const pathname = "helps/pickup-info";
const labelPage = "Informasi Pengambilan";

export const metadata: Metadata = {
  title: labelPage,
};

const PickUpInfoPage = async () => {
  // if (!auth) redirect(`/login?redirect=${encodeURIComponent(pathname)}`);

  return (
    <MainContainer breadcrumbs={[{ label: "Bantuan" }, { label: labelPage }]}>
      <div className="h-[200vh] bg-gray-400 rounded-md"></div>
    </MainContainer>
  );
};

export default PickUpInfoPage;
