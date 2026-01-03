// import { auth } from "@/lib/action/auth";
import { redirect } from "next/navigation";
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

const HomePage = async (props: { searchParams: SearchParams }) => {
  // const isAuth = await auth();
  const searchParams = await props.searchParams;
  // if (!isAuth) {
  //   redirect("/login");
  // } else {
  if (searchParams.fromUrl === "login") {
    redirect("/dashboard?fromUrl=login");
  }
  redirect("/dashboard");
  // }
};

export default HomePage;
