import { Metadata } from "next";
import { redirect } from "next/navigation";

const pathname = "products/conditions/product";

export const metadata: Metadata = {
  title: "Kondisi Produk",
};

const ConditionProductsPage = () => {
  // if (!auth) {
  //   redirect(`/login?redirect=${encodeURIComponent(pathname)}`);
  // } else {
  redirect(`/${pathname}`);
  // }
};

export default ConditionProductsPage;
