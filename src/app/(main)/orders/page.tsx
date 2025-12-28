import { Metadata } from "next";
import { redirect } from "next/navigation";

const pathname = "orders/list";

export const metadata: Metadata = {
  title: "Pesanan",
};

const OrdersPage = () => {
  // if (!auth) {
  //   redirect(`/login?redirect=${encodeURIComponent(pathname)}`);
  // } else {
  redirect(`/${pathname}`);
  // }
};

export default OrdersPage;
