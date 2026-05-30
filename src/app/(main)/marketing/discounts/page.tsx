import { MainContainer } from "@/components/container/main-container";
import { Metadata } from "next";
import { auth } from "@/lib/action/auth";
import { redirect } from "next/navigation";
import { DiscountMarketingClient } from "./_components/client";

const pathname = "marketing/discounts";
const labelPage = "Diskon";

export const metadata: Metadata = {
  title: labelPage,
};

const DiscountPage = async () => {
  const isAuth = await auth();
  if (!isAuth) redirect(`/login?redirect=${encodeURIComponent(pathname)}`);

  return (
    <MainContainer breadcrumbs={[{ label: "Pemasaran" }, { label: labelPage }]}>
      <DiscountMarketingClient />
    </MainContainer>
  );
};

export default DiscountPage;
