"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Input } from "./input";
import { Button } from "./button";
import { Eye, EyeOff } from "lucide-react";

function InputPassword({
  className,
  classNameWrap,
  ...props
}: React.ComponentProps<"input"> & { classNameWrap?: string }) {
  const [visible, setVisible] = React.useState(false);
  return (
    <div className={cn("relative w-full flex items-center", classNameWrap)}>
      <Input
        className={className}
        type={visible ? "text" : "password"}
        placeholder="••••••••"
        {...props}
      />
      <Button
        size={"icon"}
        variant={"ghost"}
        className="size-7 absolute right-1"
        type="button"
        tabIndex={-1}
        onClick={() => setVisible((v) => !v)}
      >
        {visible ? <EyeOff /> : <Eye />}
      </Button>
    </div>
  );
}

export { InputPassword };
