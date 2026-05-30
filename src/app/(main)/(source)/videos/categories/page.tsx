import { MainContainer } from "@/components/container/main-container";
import { auth } from "@/lib/action/auth";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { VideoCategoriesClient } from "./_components/client";

const pathname = "videos/categories";
const labelPage = "Kategori";

export const metadata: Metadata = {
  title: `${labelPage} Video`,
};

const VideoCategoriesPage = async () => {
  const isAuth = await auth();
  if (!isAuth) redirect(`/login?redirect=${encodeURIComponent(pathname)}`);

  return (
    <MainContainer breadcrumbs={[{ label: "Video" }, { label: labelPage }]}>
      <VideoCategoriesClient />
    </MainContainer>
  );
};

export default VideoCategoriesPage;
