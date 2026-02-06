import { MainContainer } from "@/components/container/main-container";
import { Metadata } from "next";
import { PaymentHelpClient } from "./_components/client";
import { auth } from "@/lib/action/auth";
import { redirect } from "next/navigation";

const pathname = "helps/payment-guide";
const labelPage = "Cara Pembayaran";

export const metadata: Metadata = {
  title: labelPage,
};

const PaymentGuidePage = async () => {
  const isAuth = await auth();
  if (!isAuth) redirect(`/login?redirect=${encodeURIComponent(pathname)}`);

  return (
    <MainContainer breadcrumbs={[{ label: "Bantuan" }, { label: labelPage }]}>
      <PaymentHelpClient />
    </MainContainer>
  );
};

export default PaymentGuidePage;
