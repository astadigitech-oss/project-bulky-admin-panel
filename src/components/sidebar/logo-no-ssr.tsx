"use client";

import { sizesImage } from "@/lib/utils";
import { useTheme } from "next-themes";
import Image from "next/image";
import React from "react";

const LogoNoSSR = () => {
  const { theme, systemTheme } = useTheme();

  return (
    <div className="relative h-7 dark:aspect-3/1 aspect-4/1">
      <Image
        src={
          theme === "dark" || (theme === "system" && systemTheme === "dark")
            ? "/assets/images/bulky.svg"
            : "/assets/images/logo-bulky.webp"
        }
        alt="logo-bulky"
        fill
        className="object-contain"
        sizes={sizesImage}
        loading="eager"
      />
    </div>
  );
};

export default LogoNoSSR;
