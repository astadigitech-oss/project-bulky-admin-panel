import { Metadata } from "next";
import { redirect } from "next/navigation";

const pathname = "settings/general";

export const metadata: Metadata = {
  title: "Pengaturan",
};

const SettingsPage = () => {
  // if (!auth) {
  //   redirect(`/login?redirect=${encodeURIComponent(pathname)}`);
  // } else {
  redirect(`/${pathname}`);
  // }
};

export default SettingsPage;
