import { MainContainer } from "@/components/container/main-container";
import { Metadata } from "next";

// const pathname = "blogs/tags";
const labelPage = "Tag";

export const metadata: Metadata = {
  title: `${labelPage} Berita`,
};

const BlogTagsPage = async () => {
  // if (!auth) redirect(`/login?redirect=${encodeURIComponent(pathname)}`);

  return (
    <MainContainer breadcrumbs={[{ label: "Berita" }, { label: labelPage }]}>
      <div className="h-[200vh] bg-gray-400 rounded-md"></div>
    </MainContainer>
  );
};

export default BlogTagsPage;
