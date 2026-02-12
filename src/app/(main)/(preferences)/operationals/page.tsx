import { auth } from "@/lib/action/auth";
import { Metadata } from "next";
import { redirect } from "next/navigation";

const pathname = "operationals/maintenance";

export const metadata: Metadata = {
  title: "Mobile",
};

const MobilesPage = async () => {
  const isAuth = await auth();
  if (!isAuth) {
    redirect(`/login?redirect=${encodeURIComponent(pathname)}`);
  } else {
    redirect(`/${pathname}`);
  }
};

export default MobilesPage;
