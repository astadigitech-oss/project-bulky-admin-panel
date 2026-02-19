import React from "react";
import { MainContainer } from "@/components/container/main-container";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { ChevronRight, Package } from "lucide-react";

const Loading = () => {
  return (
    <MainContainer breadcrumbs={[{ label: "Produk" }, { label: "Edit" }]}>
      <div className="flex flex-col gap-6 pt-4 pb-20">
        <div className="flex items-center gap-4 justify-between">
          <div className="flex items-center gap-2">
            <Button variant={"ghost"} size={"icon-lg"}>
              <Package className="size-5" />
            </Button>
            <ChevronRight className="size-4" />
            <h1 className="leading-none font-semibold text-2xl">Edit Produk</h1>
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="size-8" />
            <Skeleton className="size-8" />
          </div>
        </div>
        <Separator />
        <div className="grid gap-6 w-full max-w-5xl mx-auto">
          <div className="flex flex-col border rounded-lg border-gray-300 dark:border-gray-300/50 overflow-hidden">
            <div className="flex items-center justify-between w-full px-4 bg-gray-100 h-16">
              <p className="font-semibold">Gambar</p>
            </div>
            <div className="grid grid-cols-7 gap-3 w-full p-4">
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
          <div className="flex flex-col border rounded-lg border-gray-300 dark:border-gray-300/50 overflow-hidden gap-4">
            <div className="flex items-center justify-between w-full py-2 px-4 bg-gray-100 h-16">
              <p className="font-semibold">Data</p>
            </div>
            <div className="max-w-3xl mx-auto grid w-full gap-6 px-4">
              <Skeleton className="h-80 w-full" />
            </div>
          </div>
        </div>
      </div>
    </MainContainer>
  );
};

export default Loading;
