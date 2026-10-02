"use client";

import { useEffect, useState } from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PushTestClient } from "../push-test/push-test-client";
import { PushPromotionsClient } from "./push-promotions-client";

type InAppTab = "promo" | "test";

export function PushInAppNotificationsClient() {
  const [activeTab, setActiveTab] = useState<InAppTab>("promo");

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("tab") === "test") {
      setActiveTab("test");
    }
  }, []);

  return (
    <section className="flex flex-col gap-5 py-4">
      <header>
        <h1 className="text-2xl font-semibold leading-none">Notifikasi In-App</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Kelola promo yang dikirim ke Store dan kirim tes notifikasi ke buyer terdaftar.
        </p>
      </header>

      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value === "test" ? "test" : "promo")}
        className="gap-4"
      >
        <TabsList aria-label="Jenis notifikasi">
          <TabsTrigger value="promo">Promo Berlangsung</TabsTrigger>
          <TabsTrigger value="test">Tes Notifikasi</TabsTrigger>
        </TabsList>
        <TabsContent value="promo">
          <PushPromotionsClient />
        </TabsContent>
        <TabsContent value="test">
          <PushTestClient />
        </TabsContent>
      </Tabs>
    </section>
  );
}
