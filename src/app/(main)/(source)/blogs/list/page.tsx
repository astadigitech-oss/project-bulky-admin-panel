import { MainContainer } from "@/components/container/main-container";
import { auth } from "@/lib/action/auth";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { BlogListClient } from "./_components/client";

const pathname = "blogs/list";
const labelPage = "Berita";

export const metadata: Metadata = {
  title: labelPage,
};

const BlogListPage = async () => {
  const isAuth = await auth();
  if (!isAuth) redirect(`/login?redirect=${encodeURIComponent(pathname)}`);

  return (
    <MainContainer breadcrumbs={[{ label: labelPage }]}>
      <BlogListClient />
    </MainContainer>
  );
};

export default BlogListPage;
