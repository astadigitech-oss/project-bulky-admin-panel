import { MainContainer } from "@/components/container/main-container";
import { Metadata } from "next";
import { BannerHeroClient } from "./_components/client";
import { auth } from "@/lib/action/auth";
import { redirect } from "next/navigation";

const pathname = "operationals/hero";
const labelPage = "Hero Section";

export const metadata: Metadata = {
  title: labelPage,
};

const HeroSectionsPage = async () => {
  const isAuth = await auth();
  if (!isAuth) redirect(`/login?redirect=${encodeURIComponent(pathname)}`);

  return (
    <MainContainer
      breadcrumbs={[{ label: "Operasional" }, { label: labelPage }]}
    >
      <BannerHeroClient />
    </MainContainer>
  );
};

export default HeroSectionsPage;
