import { MainContainer } from "@/components/container/main-container";
import { Metadata } from "next";
import { OrderListClient } from "./_components/client";

// const pathname = "orders/list";
const labelPage = "Pesanan";

export const metadata: Metadata = {
  title: labelPage,
};

const OrderListPage = async () => {
  // if (!auth) redirect(`/login?redirect=${encodeURIComponent(pathname)}`);

  return (
    <MainContainer breadcrumbs={[{ label: labelPage }]}>
      <OrderListClient />
    </MainContainer>
  );
};

export default OrderListPage;
