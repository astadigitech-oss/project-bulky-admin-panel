import { MainContainer } from "@/components/container/main-container";
import { auth } from "@/lib/action/auth";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { TermsPolicyClient } from "./_components/client";

const pathname = "policies/terms";
const labelPage = "Syarat & Ketentuan";

export const metadata: Metadata = {
  title: labelPage,
};

const TermsPage = async () => {
  const isAuth = await auth();
  if (!isAuth) redirect(`/login?redirect=${encodeURIComponent(pathname)}`);

  return (
    <MainContainer breadcrumbs={[{ label: "Kebijakan" }, { label: labelPage }]}>
      <TermsPolicyClient />
    </MainContainer>
  );
};

export default TermsPage;
