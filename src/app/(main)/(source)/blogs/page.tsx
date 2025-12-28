import { Metadata } from "next";
import { redirect } from "next/navigation";

const pathname = "blogs/list";

export const metadata: Metadata = {
  title: "Berita",
};

const BlogsPage = () => {
  // if (!auth) {
  //   redirect(`/login?redirect=${encodeURIComponent(pathname)}`);
  // } else {
  redirect(`/${pathname}`);
  // }
};

export default BlogsPage;
