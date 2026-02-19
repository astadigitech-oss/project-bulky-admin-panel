import React from "react";
import { MainContainer } from "@/components/container/main-container";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { ChevronRight, Package } from "lucide-react";

const Loading = () => {
  return (
    <MainContainer breadcrumbs={[{ label: "Produk" }, { label: "Tambah" }]}>
      <div className="flex flex-col gap-6 pt-4 pb-20">
        <div className="flex items-center gap-2">
          <Button variant={"ghost"} size={"icon-lg"}>
            <Package className="size-5" />
          </Button>
          <ChevronRight className="size-4" />
          <h1 className="leading-none font-semibold text-2xl">Tambah Produk</h1>
        </div>
        <Separator />
        <div className="w-full max-w-5xl mx-auto flex flex-col gap-6">
          <div className="grid grid-cols-7 p-2 xl:p-3 border border-mutted rounded-xl gap-1.5 xl:gap-3">
            {Array.from({ length: 10 }).map((_, idx) => (
              <Skeleton
                key={idx}
                className={cn(
                  "w-full aspect-square",
                  idx === 0 && "row-span-2 col-span-2",
                )}
              />
            ))}
          </div>
          <div className="max-w-3xl mx-auto grid w-full gap-6">
            <Skeleton className="w-full h-screen" />
          </div>
        </div>
      </div>
    </MainContainer>
  );
};

export default Loading;
