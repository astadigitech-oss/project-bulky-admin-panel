import type { Metadata } from "next";
import { redirect } from "next/navigation";

const testNotificationsPath = "/marketing/push-promotions?tab=test";

export const metadata: Metadata = { title: "Tes Notifikasi" };

export default async function PushTestPage() {
  redirect(testNotificationsPath);
}
