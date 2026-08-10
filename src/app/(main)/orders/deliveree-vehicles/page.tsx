import { MainContainer } from "@/components/container/main-container";
import { Metadata } from "next";
import { DelivereeVehicleClient } from "./_components/client";
import { auth } from "@/lib/action/auth";
import { redirect } from "next/navigation";

const pathname = "orders/deliveree-vehicles";
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
        { label: "Pesanan", url: "/orders/list" },
        { label: labelPage },
      ]}
    >
      <DelivereeVehicleClient />
    </MainContainer>
  );
};

export default DelivereeVehiclePage;
