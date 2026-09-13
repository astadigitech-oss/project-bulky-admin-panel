import { MainContainer } from "@/components/container/main-container";
import { auth } from "@/lib/action/auth";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { SeasonalCampaignForm } from "../_components/_dialog/form";

export const metadata: Metadata = { title: "Tambah Campaign Seasonal" };

export default async function CreateSeasonalCampaignPage() {
  if (!(await auth())) redirect("/login?redirect=marketing%2Fseasonal-campaigns%2Fcreate");
  return <MainContainer breadcrumbs={[{ label: "Pemasaran", url: "/marketing" }, { label: "Campaign Seasonal", url: "/marketing/seasonal-campaigns" }, { label: "Tambah" }]}><SeasonalCampaignForm mode="create" /></MainContainer>;
}
