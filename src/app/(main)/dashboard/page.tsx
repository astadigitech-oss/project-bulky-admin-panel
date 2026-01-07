import { auth } from "@/lib/action/auth";
import { Metadata } from "next";
import { redirect } from "next/navigation";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

const pathname = "dashboard/transactions";

export const metadata: Metadata = {
  title: "Dasbor",
};

const DashboardPage = async (props: { searchParams: SearchParams }) => {
  const searchParams = await props.searchParams;
  const isAuth = await auth();

  if (!isAuth) {
    redirect(`/login?redirect=${encodeURIComponent(pathname)}`);
  } else {
    if (searchParams.fromUrl === "login") {
      redirect(`/${pathname}?fromUrl=login`);
    }
    redirect(`/${pathname}`);
  }
};

export default DashboardPage;
