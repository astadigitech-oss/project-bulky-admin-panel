import { auth } from "@/lib/action/auth";
import { Metadata } from "next";
import { redirect } from "next/navigation";

const pathname = "helps/how-to-buy";

export const metadata: Metadata = {
  title: "Bantuan",
};

const HelpsPage = async () => {
  const isAuth = await auth();
  if (!isAuth) {
    redirect(`/login?redirect=${encodeURIComponent(pathname)}`);
  } else {
    redirect(`/${pathname}`);
  }
};

export default HelpsPage;
