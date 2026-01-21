import { MainContainer } from "@/components/container/main-container";
import { Metadata } from "next";

// const pathname = "helps/payment-guide";
const labelPage = "Cara Pembayaran";

export const metadata: Metadata = {
  title: labelPage,
};

const PaymentGuidePage = async () => {
  // if (!auth) redirect(`/login?redirect=${encodeURIComponent(pathname)}`);

  return (
    <MainContainer breadcrumbs={[{ label: "Bantuan" }, { label: labelPage }]}>
      <div className="h-[200vh] bg-gray-400 rounded-md"></div>
    </MainContainer>
  );
};

export default PaymentGuidePage;
