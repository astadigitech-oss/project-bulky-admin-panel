import { MainContainer } from "@/components/container/main-container";
import { Metadata } from "next";
import { DisclaimerConsentDetailClient } from "./_components/client";

export const metadata: Metadata = {
  title: "Detail Persetujuan Disclaimer",
};

const DisclaimerConsentDetailPage = async ({
  params,
}: {
  params: Promise<{ consentId: string }>;
}) => {
  const { consentId } = await params;

  return (
    <MainContainer
      breadcrumbs={[
        { label: "Pesanan", url: "/orders/list" },
        {
          label: "Persetujuan Disclaimer",
          url: "/orders/disclaimer-consent/list",
        },
        { label: "Detail" },
      ]}
    >
      <DisclaimerConsentDetailClient consentId={consentId} />
    </MainContainer>
  );
};

export default DisclaimerConsentDetailPage;
