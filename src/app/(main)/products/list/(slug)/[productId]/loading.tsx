import { MainContainer } from "@/components/container/main-container";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { ChevronRight, Package } from "lucide-react";
import React from "react";

const Loading = () => {
  return (
    <MainContainer breadcrumbs={[{ label: "Produk" }, { label: "Detail" }]}>
      <div className="flex flex-col gap-6 pt-4 pb-20">
        <div className="flex items-center gap-4 justify-between">
          <div className="flex items-center gap-2">
            <Button variant={"ghost"} size={"icon-lg"}>
              <Package className="size-5" />
            </Button>
            <ChevronRight className="size-4" />
            <h1 className="leading-none font-semibold text-2xl">
              Detail Produk
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="size-8" />
            <Skeleton className="size-8" />
            <Skeleton className="size-8" />
          </div>
        </div>
        <Separator />
        <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto">
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold">Gambar</p>
            <div className="grid grid-cols-7 grid-rows-2 gap-3 w-full border rounded-lg p-3 border-gray-300 dark:border-gray-300/50">
              {Array.from({ length: 10 }, (_, i) => (
                <Skeleton
                  key={i}
                  className={cn(
                    "w-full aspect-square",
                    i === 0 && "col-span-2 row-span-2",
                  )}
                />
              ))}
            </div>
          </div>
          <div className="grid grid-cols-4 gap-6">
            <div className="col-span-3 flex flex-col gap-6">
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
              <Skeleton className="h-16" />
              <Skeleton className="h-24" />
            </div>
            <div className="col-span-1 flex flex-col gap-6">
              <Skeleton className="h-16" />
              <Skeleton className="h-16" />
              <Skeleton className="h-16" />
            </div>
          </div>
        </div>
      </div>
    </MainContainer>
  );
};

export default Loading;
