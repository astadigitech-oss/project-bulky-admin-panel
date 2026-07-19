import { MainContainer } from "@/components/container/main-container";
import { Metadata } from "next";
import { DisclaimerConsentListClient } from "./_components/client";

const labelPage = "Persetujuan Disclaimer";

export const metadata: Metadata = {
  title: labelPage,
};

const DisclaimerConsentListPage = async () => {
  return (
    <MainContainer breadcrumbs={[{ label: "Pesanan", url: "/orders/list" }, { label: labelPage }]}>
      <DisclaimerConsentListClient />
    </MainContainer>
  );
};

export default DisclaimerConsentListPage;
