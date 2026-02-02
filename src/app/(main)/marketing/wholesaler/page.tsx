import { MainContainer } from "@/components/container/main-container";
import { Metadata } from "next";
import { WholesalerMarketingClient } from "./_components/client";
import { auth } from "@/lib/action/auth";
import { redirect } from "next/navigation";

const pathname = "marketing/wholesaler";
const labelPage = "Formulir Grosir";

export const metadata: Metadata = {
  title: labelPage,
};

const WholesalerFormPage = async () => {
  const isAuth = await auth();
  if (!isAuth) redirect(`/login?redirect=${encodeURIComponent(pathname)}`);

  return (
    <MainContainer breadcrumbs={[{ label: "Pemasaran" }, { label: labelPage }]}>
      <WholesalerMarketingClient />
    </MainContainer>
  );
};

export default WholesalerFormPage;
