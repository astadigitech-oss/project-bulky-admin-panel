import { MainContainer } from "@/components/container/main-container";
import { Metadata } from "next";
import { OrderReviewsClient } from "./_components/client";

// const pathname = "orders/reviews";
const labelPage = "Ulasan";

export const metadata: Metadata = {
  title: `${labelPage} Pesanan`,
};

const OrdersReviewsPage = async () => {
  // if (!auth) redirect(`/login?redirect=${encodeURIComponent(pathname)}`);

  return (
    <MainContainer
      breadcrumbs={[
        { label: "Pesanan", url: "/orders/list" },
        { label: labelPage },
      ]}
    >
      <OrderReviewsClient />
    </MainContainer>
  );
};

export default OrdersReviewsPage;
