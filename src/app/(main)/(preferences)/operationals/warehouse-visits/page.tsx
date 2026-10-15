import { auth } from "@/lib/action/auth";
import { Metadata } from "next";
import { redirect } from "next/navigation";

const basePath = "operationals/warehouse-visits";

export const metadata: Metadata = {
  title: "Kunjungan Gudang",
};

const WarehouseVisitsPage = async () => {
  const isAuth = await auth();
  if (!isAuth) {
    redirect(`/login?redirect=${encodeURIComponent(`${basePath}/schedules`)}`);
  }

  redirect(`/${basePath}/schedules`);
};

export default WarehouseVisitsPage;
