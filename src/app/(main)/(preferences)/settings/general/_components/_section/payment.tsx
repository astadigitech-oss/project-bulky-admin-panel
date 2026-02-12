"use client";

import { CreditCard, Landmark, QrCode, Wallet2 } from "lucide-react";
import { useGetPayment, useUpdatePayment } from "../../_api";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";

export const PaymentSetting = () => {
  const { mutate, isPending } = useUpdatePayment();
  const { data, isLoading } = useGetPayment();
  const paymentList = data?.data || [];

  const handleChangeStatus = (id: string) => {
    mutate({ params: { id } });
  };
  return (
    <div className="grid lg:grid-cols-3 max-w-4xl mx-auto w-full gap-4">
      <div className="p-4">
        <h2 className="font-semibold text-lg lg:text-xl tracking-tight flex items-center relative before:content-[''] before:absolute before:-left-3 before:w-1 before:h-5  before:bg-linear-to-b before:from-yellow-400 before:to-yellow-500 before:rounded-full">
          Metode Pembayaran
        </h2>
      </div>
      <div className="flex flex-col gap-4 border p-2 lg:p-4 rounded-lg dark:bg-gray-900/70 lg:col-span-2">
        {isLoading && paymentList.length == 0
          ? Array.from({ length: 5 }, (_, i) => (
              <Skeleton key={i} className="h-10" />
            ))
          : paymentList.map((item) => (
              <div key={item.group} className="flex flex-col gap-2">
                <div className="h-12 flex items-center border rounded-md text-sm px-2 font-medium gap-2 bg-yellow-50 dark:bg-yellow-300/20">
                  <div className="size-8 flex items-center justify-center rounded bg-yellow-300 border border-yellow-400 dark:bg-yellow-500 dark:border-yellow-600 dark:text-yellow-950">
                    {item.group === "Bank Transfer / VA" && (
                      <Landmark className="size-4" />
                    )}
                    {item.group === "E-Wallet" && (
                      <Wallet2 className="size-4" />
                    )}
                    {item.group === "Kartu Kredit" && (
                      <CreditCard className="size-4" />
                    )}
                    {item.group === "QRIS" && <QrCode className="size-4" />}
                  </div>
                  <p>{item.group}</p>
                </div>
                <div className="flex flex-col w-full gap-2">
                  {item.methods.map((i) => (
                    <div
                      key={i.id}
                      className="h-10 flex items-center rounded-md border text-xs font-medium px-5"
                    >
                      <div className="h-5 flex items-center relative before:content-[''] before:absolute before:-left-3 before:w-1 before:h-full  before:bg-linear-to-b before:from-yellow-400 before:to-yellow-500 before:rounded-full">
                        {i.nama}
                      </div>
                      <Switch
                        className={
                          "ml-auto data-checked:bg-emerald-500 data-unchecked:bg-red-500"
                        }
                        size="sm"
                        disabled={isPending}
                        checked={Boolean(i.is_active)}
                        onCheckedChange={() => handleChangeStatus(i.id)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
      </div>
    </div>
  );
};
