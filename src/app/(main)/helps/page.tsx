import { Metadata } from "next";
import { redirect } from "next/navigation";

const pathname = "helps/pickup-info";

export const metadata: Metadata = {
  title: "Bantuan",
};

const HelpsPage = () => {
  // if (!auth) {
  //   redirect(`/login?redirect=${encodeURIComponent(pathname)}`);
  // } else {
  redirect(`/${pathname}`);
  // }
};

export default HelpsPage;
