import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Circle,
  CircleDot,
  Edit2,
  LucideIcon,
  Trash,
} from "lucide-react";
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Image from "next/image";
import { cn, formatImageAlt, sizesImage } from "@/lib/utils";
import Autoplay from "embla-carousel-autoplay";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { TooltipText } from "@/providers/tooltip-provider";
import { BannerTypeProductType } from "../../_api/types";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Options } from "nuqs";
import { Spinner } from "@/components/ui/spinner";
import { VariantProps } from "class-variance-authority";

export const BannerCard = ({
  list,
  label,
  value,
  icon: Icon,
  setIsOpen,
  setBannerId,
  handleDelete,
  handleSort,
  handleStatus,
  isLoading,
}: {
  icon: LucideIcon;
  list: BannerTypeProductType[];
  label: string;
  value: string;
  setIsOpen: Dispatch<SetStateAction<"create" | "edit" | undefined>>;
  setBannerId: (
    value: string | ((old: string) => string | null) | null,
    options?: Options,
  ) => Promise<URLSearchParams>;
  handleDelete: (id: string, label: string) => Promise<void>;
  handleSort: (
    id: string,
    label: string,
    direction: "up" | "down",
  ) => Promise<void>;
  handleStatus: (
    id: string,
    label: string,
    variant: VariantProps<typeof buttonVariants>["variant"],
  ) => Promise<void>;
  isLoading: boolean;
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [showProgress, setShowProgress] = useState(true);
  const [api, setApi] = useState<CarouselApi>();

  const data = list[selectedIndex];

  const emblaRef = useRef(
    Autoplay({ delay: 10000, stopOnInteraction: true, stopOnMouseEnter: true }),
  );
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const delayRef = useRef<number>(0);

  useEffect(() => {
    if (list.length <= 1) {
      setShowProgress(false);
      return;
    }
    if (!api) return;

    const autoplay = api.plugins().autoplay;
    if (!autoplay) return;

    delayRef.current = (autoplay.options.delay as number) ?? 2500;

    const loop = () => {
      if (startTimeRef.current === null) return;

      const elapsed = performance.now() - startTimeRef.current;
      const value = Math.min((elapsed / delayRef.current) * 100, 100);

      setProgress(value);
      rafRef.current = requestAnimationFrame(loop);
    };

    const onTimerSet = () => {
      startTimeRef.current = performance.now();
      setProgress(0);
      setShowProgress(true);

      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(loop);
    };

    const onTimerStopped = () => {
      startTimeRef.current = null;
      setProgress(0);

      setShowProgress(false);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };

    const onSelect = () => {
      setSelectedIndex(api.selectedScrollSnap());
    };

    api.on("autoplay:timerset", onTimerSet);
    api.on("autoplay:timerstopped", onTimerStopped);
    onSelect(); // sync awal
    api.on("select", onSelect);

    return () => {
      api.off("autoplay:timerset", onTimerSet);
      api.off("autoplay:timerstopped", onTimerStopped);
      api.off("select", onSelect);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [api, list]);
  return (
    <AccordionItem className={"gap-0 px-4"} value={value}>
      <AccordionTrigger className={"py-6"}>
        <div className="flex items-center gap-3">
          <div className="size-8 rounded-full bg-yellow-300 flex items-center justify-center">
            <Icon className="size-4" />
          </div>
          {label}
        </div>
      </AccordionTrigger>
      <AccordionContent className={"pb-4"}>
        <Carousel
          plugins={[emblaRef?.current]}
          onMouseEnter={() => {
            if (emblaRef.current && list.length > 1) emblaRef?.current.stop();
          }}
          onMouseLeave={() => {
            if (emblaRef.current && list.length > 1) emblaRef?.current?.play();
          }}
          opts={{ loop: true }}
          setApi={setApi}
          className="overflow-hidden"
        >
          <div className="p-4 border rounded-md">
            <CarouselContent>
              {list?.map((item) => (
                <CarouselItem key={item.id}>
                  <div className="relative aspect-4/1 rounded overflow-hidden">
                    <div
                      data-show={showProgress}
                      className="w-full absolute left-0 z-50 data-[show=true]:top-2 data-[show=false]:-top-5 data-[show=false]:scale-80 duration-500 transition-all"
                    >
                      <div className="w-4/5 mx-auto px-3 py-1.5 rounded-full bg-gray-900/20 dark:bg-gray-900/50">
                        <Progress
                          value={Math.round(progress)}
                          classIndicator="bg-yellow-500 dark:bg-yellow-300"
                        />
                      </div>
                    </div>
                    <Image
                      src={item.gambar_url}
                      alt={formatImageAlt(item.nama)}
                      fill
                      sizes={sizesImage}
                      className="object-cover"
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-2">
                <Button
                  size={"icon"}
                  className={"rounded-full"}
                  onClick={() => {
                    if (api?.plugins().autoplay) api.plugins().autoplay.stop();
                    api?.scrollPrev();
                  }}
                  disabled={!api?.canScrollPrev() || isLoading}
                >
                  <ChevronLeft />
                </Button>
                <Button
                  size={"icon"}
                  className={"rounded-full"}
                  onClick={() => {
                    if (api?.plugins().autoplay) api.plugins().autoplay.stop();
                    api?.scrollNext();
                  }}
                  disabled={!api?.canScrollNext() || isLoading}
                >
                  <ChevronRight />
                </Button>
              </div>
              <div className="flex items-center gap-2">
                {api?.scrollSnapList().map((_, index) => (
                  <Button
                    key={index}
                    size={"icon-xs"}
                    variant={selectedIndex === index ? "default" : "outline"}
                    className={"rounded-full"}
                    disabled={isLoading}
                    onClick={() => {
                      if (api?.plugins().autoplay)
                        api.plugins().autoplay.stop();
                      api?.scrollTo(index);
                    }}
                  >
                    {index + 1}
                  </Button>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-4 w-full">
            <div className="p-4 rounded-md grid grid-cols-4 border gap-2">
              <div className="flex flex-col gap-1">
                <Label>Nama</Label>
                <p>{data?.nama}</p>
              </div>
              <div className="flex flex-col gap-1">
                <Label>Tipe Produk</Label>
                <p>{data?.tipe_produk.nama}</p>
              </div>
              <div className="flex flex-col gap-1">
                <Label>Status</Label>
                <div
                  className={cn(
                    "flex items-center gap-2 text-xs bg-green-500/20 px-2 py-0.5 rounded-full font-medium w-fit",
                    data?.is_active
                      ? "bg-green-500/20 dark:bg-green-500/30 dark:text-emerald-100 text-emerald-600"
                      : "bg-red-500/10 dark:bg-red-500/30 dark:text-red-200 text-red-600",
                  )}
                >
                  <div
                    className={cn(
                      "size-2 rounded-full",
                      data?.is_active ? "bg-green-500" : "bg-red-500",
                    )}
                  />
                  {data?.is_active ? "Aktif" : "Tidak Aktif"}
                </div>
              </div>
              <div className="flex items-center gap-2 ml-auto flex-wrap">
                <TooltipText
                  value="Naikkan urutan"
                  render={
                    <Button
                      size={"icon-xs"}
                      variant={"outline"}
                      disabled={isLoading}
                      onClick={() =>
                        handleSort(data.id, `Naikan urutan ${data.nama}`, "up")
                      }
                    >
                      {isLoading ? <Spinner /> : <ChevronUp />}
                    </Button>
                  }
                />
                <TooltipText
                  value="Turunkan urutan"
                  render={
                    <Button
                      size={"icon-xs"}
                      variant={"outline"}
                      disabled={isLoading}
                      onClick={() =>
                        handleSort(
                          data.id,
                          `Turunkan urutan ${data.nama}`,
                          "down",
                        )
                      }
                    >
                      {isLoading ? <Spinner /> : <ChevronDown />}
                    </Button>
                  }
                />
                <TooltipText
                  value={data?.is_active ? "Nonaktifkan" : "Aktifkan"}
                  render={
                    <Button
                      size={"icon-xs"}
                      variant={"outline"}
                      disabled={isLoading}
                      onClick={() =>
                        handleStatus(
                          data.id,
                          data.is_active
                            ? `Nonaktifkan ${data.nama}`
                            : `Aktifkan ${data.nama}`,
                          data.is_active ? "destructive" : "default",
                        )
                      }
                    >
                      {isLoading ? (
                        <Spinner />
                      ) : data?.is_active ? (
                        <Circle />
                      ) : (
                        <CircleDot />
                      )}
                    </Button>
                  }
                />
                <TooltipText
                  value="Edit"
                  render={
                    <Button
                      size={"icon-xs"}
                      variant={"outline"}
                      disabled={isLoading}
                      onClick={() => {
                        setIsOpen("edit");
                        setBannerId(data.id);
                      }}
                    >
                      {isLoading ? <Spinner /> : <Edit2 />}
                    </Button>
                  }
                />
                <TooltipText
                  value="Hapus"
                  render={
                    <Button
                      size={"icon-xs"}
                      variant={"outline"}
                      disabled={isLoading}
                      onClick={() => handleDelete(data.id, data.nama)}
                    >
                      {isLoading ? <Spinner /> : <Trash />}
                    </Button>
                  }
                />
              </div>
            </div>
          </div>
        </Carousel>
      </AccordionContent>
    </AccordionItem>
  );
};
