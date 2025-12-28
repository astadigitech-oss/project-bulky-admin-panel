import { Metadata } from "next";
import { redirect } from "next/navigation";

const pathname = "policies/terms";

export const metadata: Metadata = {
  title: "Kebijakan",
};

const PoliciesPage = () => {
  // if (!auth) {
  //   redirect(`/login?redirect=${encodeURIComponent(pathname)}`);
  // } else {
  redirect(`/${pathname}`);
  // }
};

export default PoliciesPage;
