import { Metadata } from "next";
import { redirect } from "next/navigation";

const pathname = "products/list";

export const metadata: Metadata = {
  title: "Produk",
};

const ProductsPage = () => {
  // if (!auth) {
  //   redirect(`/login?redirect=${encodeURIComponent(pathname)}`);
  // } else {
  redirect(`/${pathname}`);
  // }
};

export default ProductsPage;
