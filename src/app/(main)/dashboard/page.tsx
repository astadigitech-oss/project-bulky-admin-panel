import { Metadata } from "next";
import { redirect } from "next/navigation";

const pathname = "dashboard/transaction";

export const metadata: Metadata = {
  title: "Dasbor",
};

const DashboardPage = () => {
  // if (!auth) {
  //   redirect(`/login?redirect=${encodeURIComponent(pathname)}`);
  // } else {
  redirect(`/${pathname}`);
  // }
};

export default DashboardPage;
