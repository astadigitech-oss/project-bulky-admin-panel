import { MainContainer } from "@/components/container/main-container";
import { Metadata } from "next";
import { DisclaimerPolicyClient } from "./_components/client";
import { auth } from "@/lib/action/auth";
import { redirect } from "next/navigation";

const pathname = "policies/disclaimer";
const labelPage = "Penaifan";

export const metadata: Metadata = {
  title: labelPage,
};

const DisclaimerPage = async () => {
  const isAuth = await auth();
  if (!isAuth) redirect(`/login?redirect=${encodeURIComponent(pathname)}`);

  return (
    <MainContainer breadcrumbs={[{ label: "Kebijakan" }, { label: labelPage }]}>
      <DisclaimerPolicyClient />
    </MainContainer>
  );
};

export default DisclaimerPage;
