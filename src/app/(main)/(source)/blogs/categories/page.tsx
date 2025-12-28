import { MainContainer } from "@/components/container/main-container";
import { Metadata } from "next";

// const pathname = "blogs/categories";
const labelPage = "Kategori";

export const metadata: Metadata = {
  title: `${labelPage} Berita`,
};

const BlogCategoriesPage = async () => {
  // if (!auth) redirect(`/login?redirect=${encodeURIComponent(pathname)}`);

  return (
    <MainContainer breadcrumbs={[{ label: "Berita" }, { label: labelPage }]}>
      <div className="h-[200vh] bg-gray-400 rounded-md"></div>
    </MainContainer>
  );
};

export default BlogCategoriesPage;
