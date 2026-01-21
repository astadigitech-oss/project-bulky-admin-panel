import { MainContainer } from "@/components/container/main-container";
import { Metadata } from "next";

// const pathname = "policies/terms";
const labelPage = "Syarat & Ketentuan";

export const metadata: Metadata = {
  title: labelPage,
};

const TermsPage = async () => {
  // if (!auth) redirect(`/login?redirect=${encodeURIComponent(pathname)}`);

  return (
    <MainContainer breadcrumbs={[{ label: "Kebijakan" }, { label: labelPage }]}>
      <div className="h-[200vh] bg-gray-400 rounded-md"></div>
    </MainContainer>
  );
};

export default TermsPage;
