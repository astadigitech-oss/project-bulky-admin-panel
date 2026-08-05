"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

const LogoNoSSR = dynamic(() => import("@/components/sidebar/logo-no-ssr"), {
  ssr: false,
  loading: () => <Skeleton className="h-7 w-1/2" />,
});

export const ClientLogo = () => <LogoNoSSR />;
