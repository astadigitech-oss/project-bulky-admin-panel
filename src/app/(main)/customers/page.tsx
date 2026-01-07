import { MainContainer } from "@/components/container/main-container";
import { Metadata } from "next";
import { CustomersClient } from "./_components/client";

// const pathname = "customers";

export const metadata: Metadata = {
  title: "Pelanggan",
};

const CustomersPage = async () => {
  // if (!auth) redirect(`/login?redirect=${encodeURIComponent(pathname)}`);

  return (
    <MainContainer breadcrumbs={[{ label: "Pelanggan" }]}>
      <CustomersClient />
    </MainContainer>
  );
};

export default CustomersPage;
