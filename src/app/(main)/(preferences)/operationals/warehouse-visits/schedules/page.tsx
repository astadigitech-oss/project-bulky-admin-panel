import { MainContainer } from "@/components/container/main-container";
import { auth } from "@/lib/action/auth";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { WarehouseVisitsClient } from "../_components/client";

const pathname = "operationals/warehouse-visits/schedules";
const labelPage = "Jadwal Kunjungan";

export const metadata: Metadata = {
  title: labelPage,
};

const isDate = (value?: string): value is string => Boolean(value && /^\d{4}-\d{2}-\d{2}$/.test(value));

const WarehouseVisitSchedulesPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) => {
  const isAuth = await auth();
  if (!isAuth) redirect(`/login?redirect=${encodeURIComponent(pathname)}`);
  const { from, to } = await searchParams;
  const initialRange =
    isDate(from) && isDate(to) && from <= to ? { from, to } : undefined;

  return (
    <MainContainer
      breadcrumbs={[{ label: "Kunjungan Gudang" }, { label: labelPage }]}
    >
      <WarehouseVisitsClient view="dates" initialRange={initialRange} />
    </MainContainer>
  );
};

export default WarehouseVisitSchedulesPage;
