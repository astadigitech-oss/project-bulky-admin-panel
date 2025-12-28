"use client";

import React from "react";
import { Button } from "./ui/button";
import { useTheme } from "next-themes";
import { Monitor, Moon, SunDim } from "lucide-react";

const ToggleTheme = () => {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant={"outline"}
      className="rounded-full shadow-sm"
      size={"icon"}
      onClick={() =>
        setTheme(
          theme === "light" ? "dark" : theme === "dark" ? "system" : "light",
        )
      }
    >
      {theme === "light" && <Moon />}
      {theme === "dark" && <Monitor />}
      {theme === "system" && <SunDim />}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
};

export default ToggleTheme;
