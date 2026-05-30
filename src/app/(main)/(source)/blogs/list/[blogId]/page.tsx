import { MainContainer } from "@/components/container/main-container";
import { auth } from "@/lib/action/auth";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { BlogFormPageClient } from "./_components";

const pathname = "blogs/list";

export const metadata: Metadata = {
  title: "Form Berita",
};

const BlogFormPage = async ({
  params,
}: {
  params: Promise<{ blogId: string }>;
}) => {
  const isAuth = await auth();
  if (!isAuth) redirect(`/login?redirect=${encodeURIComponent(pathname)}`);

  const { blogId } = await params;
  const isCreate = blogId === "create";

  return (
    <MainContainer
      breadcrumbs={[
        { label: "Berita", url: "/blogs/list" },
        { label: isCreate ? "Tambah" : "Edit" },
      ]}
    >
      <BlogFormPageClient />
    </MainContainer>
  );
};

export default BlogFormPage;
