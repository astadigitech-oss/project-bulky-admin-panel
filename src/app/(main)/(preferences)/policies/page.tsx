import { auth } from "@/lib/action/auth";
import { Metadata } from "next";
import { redirect } from "next/navigation";

const pathname = "policies/terms";

export const metadata: Metadata = {
  title: "Pengaturan",
};

const SettingsPage = async () => {
  const isAuth = await auth();
  if (!isAuth) {
    redirect(`/login?redirect=${encodeURIComponent(pathname)}`);
  } else {
    redirect(`/${pathname}`);
  }
};

export default SettingsPage;
