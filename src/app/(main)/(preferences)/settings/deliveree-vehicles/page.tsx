import { MainContainer } from "@/components/container/main-container";
import { Metadata } from "next";
import { DelivereeVehicleClient } from "./_components/client";
import { auth } from "@/lib/action/auth";
import { redirect } from "next/navigation";

const pathname = "settings/deliveree-vehicles";
const labelPage = "Kendaraan Deliveree";

export const metadata: Metadata = {
  title: labelPage,
};

const DelivereeVehiclePage = async () => {
  const isAuth = await auth();
  if (!isAuth) redirect(`/login?redirect=${encodeURIComponent(pathname)}`);

  return (
    <MainContainer
      breadcrumbs={[
        { label: "Pengaturan", url: "/settings/general" },
        { label: labelPage },
      ]}
    >
      <DelivereeVehicleClient />
    </MainContainer>
  );
};

export default DelivereeVehiclePage;
