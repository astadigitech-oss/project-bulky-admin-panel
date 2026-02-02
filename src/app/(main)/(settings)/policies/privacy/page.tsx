import { MainContainer } from "@/components/container/main-container";
import { Metadata } from "next";
import { PrivacyPolicyClient } from "./_components/client";
import { auth } from "@/lib/action/auth";
import { redirect } from "next/navigation";

const pathname = "policies/privacy";
const labelPage = "Kebijakan Privasi";

export const metadata: Metadata = {
  title: labelPage,
};

const PrivacyPage = async () => {
  const isAuth = await auth();
  if (!isAuth) redirect(`/login?redirect=${encodeURIComponent(pathname)}`);

  return (
    <MainContainer breadcrumbs={[{ label: "Kebijakan" }, { label: labelPage }]}>
      <PrivacyPolicyClient />
    </MainContainer>
  );
};

export default PrivacyPage;
