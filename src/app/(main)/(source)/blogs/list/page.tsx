import { MainContainer } from "@/components/container/main-container";
import { Metadata } from "next";

// const pathname = "blogs/list";
const labelPage = "Berita";

export const metadata: Metadata = {
  title: labelPage,
};

const BlogListPage = async () => {
  // if (!auth) redirect(`/login?redirect=${encodeURIComponent(pathname)}`);

  return (
    <MainContainer breadcrumbs={[{ label: labelPage }]}>
      <div className="h-[200vh] bg-gray-400 rounded-md"></div>
    </MainContainer>
  );
};

export default BlogListPage;
