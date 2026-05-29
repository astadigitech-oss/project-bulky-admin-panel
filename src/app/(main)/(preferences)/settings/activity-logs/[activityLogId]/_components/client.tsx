"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CenteredPageLoader } from "@/components/loaders/centered-page-loader";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import Link from "next/link";
import { useGetActivityLogDetail } from "../../_api";

const DetailItem = ({ label, value }: { label: string; value: string }) => (
  <div className="grid grid-cols-12 gap-3 text-sm">
    <p className="col-span-3 text-muted-foreground">{label}</p>
    <p className="col-span-9 break-all">{value || "-"}</p>
  </div>
);

export const ActivityLogDetailClient = ({
  activityLogId,
}: {
  activityLogId: string;
}) => {
  const { data, isLoading } = useGetActivityLogDetail({ id: activityLogId });
  const detail = data?.data;

  if (isLoading) {
    return <CenteredPageLoader label="Memuat detail log aktivitas..." />;
  }

  if (!detail) {
    return (
      <div className="flex flex-col gap-4">
        <p>Detail log aktivitas tidak ditemukan.</p>
        <Link href="/settings/activity-logs">
          <Button variant="outline">Kembali</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-lg border p-4 md:p-6 space-y-4">
      <DetailItem label="ID" value={detail.id} />
      <DetailItem label="User Type" value={detail.user_type} />
      <DetailItem label="User ID" value={detail.user_id ?? "-"} />
      <DetailItem label="Action" value={detail.action} />
      <DetailItem label="Modul" value={detail.modul} />
      <DetailItem label="Entity Type" value={detail.entity_type ?? "-"} />
      <DetailItem label="Entity ID" value={detail.entity_id ?? "-"} />
      <DetailItem label="Deskripsi" value={detail.deskripsi} />
      <DetailItem label="IP Address" value={detail.ip_address} />
      <DetailItem label="User Agent" value={detail.user_agent} />
      <DetailItem
        label="Created At"
        value={format(detail.created_at, "PPpp", { locale: id })}
      />
      <Separator />
      <Link href="/settings/activity-logs">
        <Button variant="outline">Kembali ke List</Button>
      </Link>
    </div>
  );
};
