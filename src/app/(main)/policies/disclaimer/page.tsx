import { MainContainer } from "@/components/container/main-container";
import { Metadata } from "next";

// const pathname = "policies/disclaimer";
const labelPage = "Penaifan";

export const metadata: Metadata = {
  title: labelPage,
};

const DisclaimerPage = async () => {
  // if (!auth) redirect(`/login?redirect=${encodeURIComponent(pathname)}`);

  return (
    <MainContainer breadcrumbs={[{ label: "Kebijakan" }, { label: labelPage }]}>
      <div className="h-[200vh] bg-gray-400 rounded-md"></div>
    </MainContainer>
  );
};

export default DisclaimerPage;
