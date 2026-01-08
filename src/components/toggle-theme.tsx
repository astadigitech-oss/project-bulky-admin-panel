"use client";

import React, { ComponentProps } from "react";
import { Button } from "./ui/button";
import { useTheme } from "next-themes";
import { Monitor, Moon, SunDim } from "lucide-react";
import { cn } from "@/lib/utils";

const ToggleTheme = ({
  className,
  ...props
}: ComponentProps<typeof Button>) => {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant={"outline"}
      className={cn("rounded-full shadow-sm", className)}
      size={"icon"}
      onClick={() =>
        setTheme(
          theme === "light" ? "dark" : theme === "dark" ? "system" : "light",
        )
      }
      {...props}
    >
      {theme === "light" && <Moon />}
      {theme === "dark" && <Monitor />}
      {theme === "system" && <SunDim />}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
};

export default ToggleTheme;
