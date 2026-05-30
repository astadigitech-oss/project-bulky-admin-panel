import { MainContainer } from "@/components/container/main-container";
import { auth } from "@/lib/action/auth";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { VideoListClient } from "./_components/client";

const pathname = "videos/list";
const labelPage = "Video";

export const metadata: Metadata = {
  title: labelPage,
};

const VideosListPage = async () => {
  const isAuth = await auth();
  if (!isAuth) redirect(`/login?redirect=${encodeURIComponent(pathname)}`);

  return (
    <MainContainer breadcrumbs={[{ label: labelPage }]}>
      <VideoListClient />
    </MainContainer>
  );
};

export default VideosListPage;
