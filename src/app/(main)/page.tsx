import { getAuthPermissions } from "@/lib/action/auth";
import { redirect } from "next/navigation";
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

const HomePage = async (props: { searchParams: SearchParams }) => {
  const permissions = await getAuthPermissions();
  const searchParams = await props.searchParams;

  if (!permissions) redirect("/login");
  if (permissions.includes("warehouse_visit:read")) {
    redirect("/operationals/warehouse-visits/schedules");
  }
  if (searchParams.fromUrl === "login") {
    redirect("/dashboard/overview?fromUrl=login");
  }
  redirect("/dashboard/overview");
};

export default HomePage;
