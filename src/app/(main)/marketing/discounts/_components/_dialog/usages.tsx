"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ComponentProps } from "react";
import { useGetCouponUsages } from "../../_api";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { formatRupiah } from "@/lib/utils";

export const DialogCouponUsages = ({
  open,
  onOpenChange,
  couponId,
}: Pick<ComponentProps<typeof Dialog>, "open" | "onOpenChange"> & {
  couponId?: string;
}) => {
  const { data, isLoading } = useGetCouponUsages({
    id: couponId,
    page: 1,
    per_page: 20,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="md:min-w-3xl" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Penggunaan Kupon</DialogTitle>
          <DialogDescription>
            {data?.data.kupon.kode
              ? `Riwayat pemakaian kupon ${data.data.kupon.kode}`
              : "Riwayat pemakaian kupon"}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <Skeleton className="w-full h-64" />
        ) : (
          <div className="max-h-[60vh] overflow-auto rounded-md border">
            <table className="w-full text-sm">
              <thead className="bg-muted sticky top-0">
                <tr>
                  <th className="text-left p-3">Buyer</th>
                  <th className="text-left p-3">Pesanan</th>
                  <th className="text-left p-3">Potongan</th>
                  <th className="text-left p-3">Dipakai Pada</th>
                </tr>
              </thead>
              <tbody>
                {(data?.data.usages ?? []).length === 0 ? (
                  <tr>
                    <td className="p-3 text-muted-foreground" colSpan={4}>
                      Belum ada penggunaan kupon.
                    </td>
                  </tr>
                ) : (
                  (data?.data.usages ?? []).map((usage) => (
                    <tr key={usage.id} className="border-t">
                      <td className="p-3">
                        <div className="font-medium">{usage.buyer.nama}</div>
                        <div className="text-xs text-muted-foreground">
                          {usage.buyer.email}
                        </div>
                      </td>
                      <td className="p-3">{usage.pesanan.kode}</td>
                      <td className="p-3">
                        {formatRupiah(usage.nilai_potongan)}
                      </td>
                      <td className="p-3">
                        {format(usage.created_at, "PPpp", { locale: localeId })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
