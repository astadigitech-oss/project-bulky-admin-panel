import { MainContainer } from "@/components/container/main-container";
import { Metadata } from "next";
import { ForwarderMappingClient } from "./_components/client";
import { auth } from "@/lib/action/auth";
import { redirect } from "next/navigation";

const pathname = "products/forwarder-mapping";
const labelPage = "Forwarder Mapping";

export const metadata: Metadata = {
  title: labelPage,
};

const ForwarderMappingPage = async () => {
  const isAuth = await auth();
  if (!isAuth) redirect(`/login?redirect=${encodeURIComponent(pathname)}`);

  return (
    <MainContainer
      breadcrumbs={[
        { label: "Produk", url: "/products/list" },
        { label: labelPage },
      ]}
    >
      <ForwarderMappingClient />
    </MainContainer>
  );
};

export default ForwarderMappingPage;
