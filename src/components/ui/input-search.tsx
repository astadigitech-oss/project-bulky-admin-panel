"use client";

import { cn } from "@/lib/utils";
import { Input } from "./input";
import { Button } from "./button";
import { Search, XCircle } from "lucide-react";
import { Options } from "nuqs";

export const InputSearch = ({
  className,
  classNameWrap,
  value,
  setValue,
  ...props
}: React.ComponentProps<"input"> & {
  classNameWrap?: string;
  value: string;
  setValue: (
    value: string | ((old: string) => string | null) | null,
    options?: Options,
  ) => Promise<URLSearchParams>;
}) => {
  return (
    <div className={cn("relative w-full flex items-center", classNameWrap)}>
      <Search className="size-3.5 absolute left-3" />
      <Input
        className={cn("pl-8 pr-9", className)}
        type={"text"}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        {...props}
      />
      <Button
        size={"icon"}
        variant={"ghost"}
        className={cn(
          "size-7 absolute right-1",
          value.length > 0 ? "visible" : "invisible",
        )}
        type="button"
        onClick={() => setValue("")}
      >
        <XCircle />
      </Button>
    </div>
  );
};
