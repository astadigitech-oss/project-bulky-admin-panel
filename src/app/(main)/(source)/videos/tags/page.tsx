import { MainContainer } from "@/components/container/main-container";
import { Metadata } from "next";

// const pathname = "videos/tags";
const labelPage = "Tag";

export const metadata: Metadata = {
  title: `${labelPage} Video`,
};

const VideosTagsPage = async () => {
  // if (!auth) redirect(`/login?redirect=${encodeURIComponent(pathname)}`);

  return (
    <MainContainer breadcrumbs={[{ label: "Video" }, { label: labelPage }]}>
      <div className="h-[200vh] bg-gray-400 rounded-md"></div>
    </MainContainer>
  );
};

export default VideosTagsPage;
