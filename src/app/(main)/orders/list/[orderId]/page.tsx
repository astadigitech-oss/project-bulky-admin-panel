import { MainContainer } from "@/components/container/main-container";
import { Metadata } from "next";
import { OrderDetailClient } from "./_components/client";

export const metadata: Metadata = {
  title: "Detail Pesanan",
};

const OrderDetailPage = async ({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) => {
  const { orderId } = await params;

  return (
    <MainContainer
      breadcrumbs={[
        { label: "Pesanan", url: "/orders/list" },
        { label: "Detail" },
      ]}
    >
      <OrderDetailClient orderId={orderId} />
    </MainContainer>
  );
};

export default OrderDetailPage;
