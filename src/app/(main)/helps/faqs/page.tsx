import { MainContainer } from "@/components/container/main-container";
import { Metadata } from "next";

// const pathname = "helps/faqs";
const labelPage = "FAQ's";

export const metadata: Metadata = {
  title: labelPage,
};

const FaqsPage = async () => {
  // if (!auth) redirect(`/login?redirect=${encodeURIComponent(pathname)}`);

  return (
    <MainContainer breadcrumbs={[{ label: "Bantuan" }, { label: labelPage }]}>
      <div className="h-[200vh] bg-gray-400 rounded-md"></div>
    </MainContainer>
  );
};

export default FaqsPage;
