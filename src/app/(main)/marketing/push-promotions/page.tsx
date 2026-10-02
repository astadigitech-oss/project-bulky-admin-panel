import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { MainContainer } from "@/components/container/main-container";
import { auth } from "@/lib/action/auth";
import { PushInAppNotificationsClient } from "./push-in-app-client";

const pathname = "marketing/push-promotions";

export const metadata: Metadata = { title: "Notifikasi In-App" };

export default async function PushPromotionsPage() {
  if (!(await auth())) redirect(`/login?redirect=${encodeURIComponent(pathname)}`);

  return (
    <MainContainer breadcrumbs={[{ label: "Pemasaran" }, { label: "Notifikasi In-App" }]}>
      <PushInAppNotificationsClient />
    </MainContainer>
  );
}
