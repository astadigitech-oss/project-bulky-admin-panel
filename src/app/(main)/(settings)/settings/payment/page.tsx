import { MainContainer } from "@/components/container/main-container";
import { Metadata } from "next";

// const pathname = "settings/payment";
const labelPage = "Metode Pembayaran";

export const metadata: Metadata = {
  title: labelPage,
};

const PaymentMethodPage = async () => {
  // if (!auth) redirect(`/login?redirect=${encodeURIComponent(pathname)}`);

  return (
    <MainContainer
      breadcrumbs={[{ label: "Pengaturan" }, { label: labelPage }]}
    >
      <div className="h-[200vh] bg-gray-400 rounded-md"></div>
    </MainContainer>
  );
};

export default PaymentMethodPage;
