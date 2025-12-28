import { MainContainer } from "@/components/container/main-container";
import { Metadata } from "next";

// const pathname = "customers";

export const metadata: Metadata = {
  title: "Pelanggan",
};

const CustomersPage = async () => {
  // if (!auth) redirect(`/login?redirect=${encodeURIComponent(pathname)}`);

  return (
    <MainContainer breadcrumbs={[{ label: "Pelanggan" }]}>
      <div className="h-[200vh] bg-gray-400 rounded-md"></div>
    </MainContainer>
  );
};

export default CustomersPage;
