import { MainContainer } from "@/components/container/main-container";
import { auth } from "@/lib/action/auth";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { BatchForm } from "../../create/_components/batch-form";
import { BreadcrumbBatchName } from "../_components/breadcrumb-batch-name";

const pathname = "auctions/[batchId]/edit";

export const metadata: Metadata = {
  title: "Edit Batch Lelang",
};

const AuctionEditPage = async ({
  params,
}: {
  params: Promise<{ batchId: string }>;
}) => {
  const isAuth = await auth();
  if (!isAuth) redirect(`/login?redirect=${encodeURIComponent(pathname)}`);

  const { batchId } = await params;

  return (
    <MainContainer
      breadcrumbs={[
        { label: "Lelang" },
        { label: "Daftar", url: "/auctions/list" },
        { label: <BreadcrumbBatchName batchId={batchId} />, key: "batch-name" },
        { label: "Edit Batch" },
      ]}
    >
      <BatchForm batchId={batchId} />
    </MainContainer>
  );
};

export default AuctionEditPage;
