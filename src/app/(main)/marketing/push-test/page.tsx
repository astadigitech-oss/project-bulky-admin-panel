import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { MainContainer } from "@/components/container/main-container";
import { auth } from "@/lib/action/auth";
import { PushTestClient } from "./push-test-client";

const pathname = "marketing/push-test";

export const metadata: Metadata = { title: "Tes Push Notification" };

export default async function PushTestPage() {
  if (!(await auth())) redirect(`/login?redirect=${encodeURIComponent(pathname)}`);

  return (
    <MainContainer breadcrumbs={[{ label: "Pemasaran" }, { label: "Tes Push Notification" }]}>
      <PushTestClient />
    </MainContainer>
  );
}
