import { Metadata } from "next";
import { redirect } from "next/navigation";

const pathname = "videos/list";

export const metadata: Metadata = {
  title: "Video",
};

const VideosPage = () => {
  // if (!auth) {
  //   redirect(`/login?redirect=${encodeURIComponent(pathname)}`);
  // } else {
  redirect(`/${pathname}`);
  // }
};

export default VideosPage;
