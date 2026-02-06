import React from "react";
import { AccountSetting } from "./_section/account";
import { Separator } from "@/components/ui/separator";
import { ChangePasswordClient } from "./_section/change-password";
import { WarehouseSettingClient } from "./_section/warehouse";
import { WhatsappServiceClient } from "./_section/whastapp-service";
import { PickupClient } from "./_section/pickup";
import { Settings } from "lucide-react";
import { PaymentSetting } from "./_section/payment";

export const GeneralSettingsClient = () => {
  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto">
      <div className="flex items-center gap-3 w-full max-w-4xl mx-auto pt-4">
        <div className="size-8 bg-yellow-300 dark:bg-yellow-500 rounded-lg flex items-center justify-center text-black">
          <Settings className="size-6 stroke-2" />
        </div>
        <h1 className="text-xl lg:text-2xl font-bold">Pengaturan Umum</h1>
      </div>
      <Separator />
      <AccountSetting />
      <Separator />
      <ChangePasswordClient />
      <Separator />
      <WarehouseSettingClient />
      <Separator />
      <WhatsappServiceClient />
      <Separator />
      <PickupClient />
      <Separator />
      <PaymentSetting />
    </div>
  );
};
