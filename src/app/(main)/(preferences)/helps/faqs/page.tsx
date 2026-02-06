import { MainContainer } from "@/components/container/main-container";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/action/auth";
import { FAQHelpClient } from "./_components/client";

const pathname = "helps/faqs";
const labelPage = "FAQ's";

export const metadata: Metadata = {
  title: labelPage,
};

const FaqsPage = async () => {
  const isAuth = await auth();
  if (!isAuth) redirect(`/login?redirect=${encodeURIComponent(pathname)}`);

  return (
    <MainContainer breadcrumbs={[{ label: "Bantuan" }, { label: labelPage }]}>
      <FAQHelpClient />
    </MainContainer>
  );
};

export default FaqsPage;
