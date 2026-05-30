import { MainContainer } from "@/components/container/main-container";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/action/auth";
import { BlogCategoriesClient } from "./_components/client";

const pathname = "blogs/categories";
const labelPage = "Kategori";

export const metadata: Metadata = {
  title: `${labelPage} Berita`,
};

const BlogCategoriesPage = async () => {
  const isAuth = await auth();
  if (!isAuth) redirect(`/login?redirect=${encodeURIComponent(pathname)}`);

  return (
    <MainContainer breadcrumbs={[{ label: "Berita" }, { label: labelPage }]}>
      <BlogCategoriesClient />
    </MainContainer>
  );
};

export default BlogCategoriesPage;
