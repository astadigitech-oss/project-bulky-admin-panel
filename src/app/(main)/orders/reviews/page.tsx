import { MainContainer } from "@/components/container/main-container";
import { Metadata } from "next";

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
      <div className="h-[200vh] bg-gray-400 rounded-md"></div>
    </MainContainer>
  );
};

export default OrdersReviewsPage;
