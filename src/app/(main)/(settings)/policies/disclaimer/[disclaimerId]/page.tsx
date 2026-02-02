import { MainContainer } from "@/components/container/main-container";
import { Metadata } from "next";
import { DisclaimerDetailClient } from "./_components/client";
import { redirect } from "next/navigation";
import { auth } from "@/lib/action/auth";

const pathname = "policies/disclaimer";

export const metadata: Metadata = {
  title: "Detail Penaifan",
};

const DisclaimerDetailPage = async ({
  params,
}: {
  params: Promise<{ disclaimerId: string }>;
}) => {
  const isAuth = await auth();
  if (!isAuth) redirect(`/login?redirect=${encodeURIComponent(pathname)}`);

  const { disclaimerId } = await params;

  return (
    <MainContainer
      breadcrumbs={[
        { label: "Kebijakan" },
        { label: "Penaifan", url: `/${pathname}` },
        { label: disclaimerId === "create" ? "Tambah" : "Edit" },
      ]}
    >
      <DisclaimerDetailClient />
    </MainContainer>
  );
};

export default DisclaimerDetailPage;
