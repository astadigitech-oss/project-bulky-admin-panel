import React from "react";
import { AccountSetting } from "./_section/account";
import { Separator } from "@/components/ui/separator";
import { ChangePasswordClient } from "./_section/change-password";
import { WarehouseSettingClient } from "./_section/warehouse";
import { WhatsappServiceClient } from "./_section/whastapp-service";
import { PickupClient } from "./_section/pickup";

export const GeneralSettingsClient = () => {
  return (
    <div className="flex flex-col gap-6 w-full max-w-3xl mx-auto">
      <h1 className="text-xl lg:text-2xl font-bold">Pengaturan Umum</h1>
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
    </div>
  );
};
