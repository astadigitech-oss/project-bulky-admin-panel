import { MainContainer } from "@/components/container/main-container";
import { Metadata } from "next";
import { BuyHelpClient } from "./_components/client";
import { auth } from "@/lib/action/auth";
import { redirect } from "next/navigation";

const pathname = "helps/how-to-buy";
const labelPage = "Cara Pembelian";

export const metadata: Metadata = {
  title: labelPage,
};

const HowToBuyPage = async () => {
  const isAuth = await auth();
  if (!isAuth) redirect(`/login?redirect=${encodeURIComponent(pathname)}`);

  return (
    <MainContainer breadcrumbs={[{ label: "Bantuan" }, { label: labelPage }]}>
      <BuyHelpClient />
    </MainContainer>
  );
};

export default HowToBuyPage;
