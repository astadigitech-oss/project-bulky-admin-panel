import { MainContainer } from "@/components/container/main-container";
import { auth } from "@/lib/action/auth";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { WarehouseVisitsClient } from "../_components/client";

const pathname = "operationals/warehouse-visits/bookings";
const labelPage = "Reservasi";

export const metadata: Metadata = {
  title: labelPage,
};

const WarehouseVisitBookingsPage = async () => {
  const isAuth = await auth();
  if (!isAuth) redirect(`/login?redirect=${encodeURIComponent(pathname)}`);

  return (
    <MainContainer
      breadcrumbs={[{ label: "Kunjungan Gudang" }, { label: labelPage }]}
    >
      <WarehouseVisitsClient view="bookings" />
    </MainContainer>
  );
};

export default WarehouseVisitBookingsPage;
