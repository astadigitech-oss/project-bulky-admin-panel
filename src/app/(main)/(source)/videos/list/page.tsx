import { MainContainer } from "@/components/container/main-container";
import { Metadata } from "next";

// const pathname = "videos/list";
const labelPage = "Video";

export const metadata: Metadata = {
  title: labelPage,
};

const VideosListPage = async () => {
  // if (!auth) redirect(`/login?redirect=${encodeURIComponent(pathname)}`);

  return (
    <MainContainer breadcrumbs={[{ label: labelPage }]}>
      <div className="h-[200vh] bg-gray-400 rounded-md"></div>
    </MainContainer>
  );
};

export default VideosListPage;
