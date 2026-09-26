import { MainContainer } from "@/components/container/main-container";
import { auth } from "@/lib/action/auth";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { TermsPolicyClient } from "../terms/_components/client";

const pathname = "policies/auction-terms";

export const metadata: Metadata = {
  title: "Syarat & Ketentuan Lelang",
};

const AuctionTermsPage = async () => {
  const isAuth = await auth();
  if (!isAuth) redirect("/login?redirect=" + encodeURIComponent(pathname));

  return (
    <MainContainer breadcrumbs={[{ label: "Lelang" }, { label: "Syarat & Ketentuan Lelang" }]}>
      <TermsPolicyClient slug="syarat-ketentuan-lelang" pageTitle="Syarat & Ketentuan Lelang" />
    </MainContainer>
  );
};

export default AuctionTermsPage;
