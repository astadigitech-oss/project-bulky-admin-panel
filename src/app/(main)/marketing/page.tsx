import { Metadata } from "next";
import { redirect } from "next/navigation";

const pathname = "marketing/discounts";

export const metadata: Metadata = {
  title: "Pemasaran",
};

const MarketingPage = () => {
  // if (!auth) {
  //   redirect(`/login?redirect=${encodeURIComponent(pathname)}`);
  // } else {
  redirect(`/${pathname}`);
  // }
};

export default MarketingPage;
