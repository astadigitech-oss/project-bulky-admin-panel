"use client";

import { Button } from "@/components/ui/button";
import {
  useChangeStatusBannerTypeProduct,
  useDeleteBannerTypeProduct,
  useGetBannerTypeProductDetail,
  useGetBannerTypeProductList,
  useGetTypeProductList,
  useReorderBannerTypeProduct,
} from "../_api";
import { Container, Package, Plus, RefreshCw, Truck } from "lucide-react";
import { BannerCard } from "./_section/banner-card";
import { Accordion } from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { parseAsString, useQueryState } from "nuqs";
import { DialogFormBannerTypeProduct } from "./_dialog/form";
import { useConfirm } from "@/hooks/use-confirm";

export const BannerTypeProductClient = () => {
  const [accordionValue, setAccordionValue] = useState(["palet-load"]);
  const [isOpen, setIsOpen] = useState<"create" | "edit">();
  const [bannerId, setBannerId] = useQueryState(
    "id",
    parseAsString.withDefault(""),
  );

  const [DialogSort, confirmSort] = useConfirm(
    "[banner]",
    "Apakah Anda yakin ingin mengubah urutan item ini?",
  );
  const [DialogDelete, confirmDelete] = useConfirm(
    "Hapus Banner [banner]",
    "Apakah anda yakin? tindakan ini bersifat permanen",
  );
  const [DialogStatus, confirmStatus] = useConfirm(
    "[banner]",
    "Tindakan tidak bersifat permanen, anda dapat mengubahnya lagi lain kali",
  );

  const { mutate: changeStatus, isPending: isChanging } =
    useChangeStatusBannerTypeProduct();
  const { mutate: deleteBanner, isPending: isDeleting } =
    useDeleteBannerTypeProduct();
  const { mutate: reorderBanner, isPending: isReordering } =
    useReorderBannerTypeProduct();

  const isLoading = isChanging || isDeleting || isReordering;

  const { data: list, refetch, isRefetching } = useGetBannerTypeProductList();
  const { data: typeProductList } = useGetTypeProductList();
  const { data: detail } = useGetBannerTypeProductDetail({ id: bannerId });

  const handleDelete = async (id: string, label: string) => {
    const ok = await confirmDelete(label, "banner");
    if (!ok) return;
    deleteBanner({ params: { id } });
  };

  const handleSort = async (
    id: string,
    label: string,
    direction: "up" | "down",
  ) => {
    const ok = await confirmSort(label, "banner");
    if (!ok) return;
    reorderBanner({ body: { direction }, params: { id } });
  };

  const handleStatus = async (id: string, label: string) => {
    const ok = await confirmStatus(label, "banner");
    if (!ok) return;
    changeStatus({ params: { id } });
  };

  return (
    <div className="flex flex-col gap-6 pt-4">
      <DialogDelete />
      <DialogStatus />
      <DialogSort />
      <DialogFormBannerTypeProduct
        open={!!isOpen}
        mode={isOpen}
        onOpenChange={(e) => {
          if (!e) {
            setIsOpen(undefined);
            if (bannerId) setBannerId("");
          }
        }}
        typeProductList={typeProductList?.data ?? []}
        setAccordionValue={setAccordionValue}
        detail={detail?.data}
      />
      <div className="flex items-center justify-between">
        <h1 className="leading-none font-semibold text-2xl">
          Banner Jenis Product
        </h1>
        <div className="flex items-center gap-2" onClick={() => refetch()}>
          <Button size={"icon"} variant={"outline"}>
            <RefreshCw
              className={cn("size-3.5", isRefetching && "animate-spin")}
            />
          </Button>
          <Button className={"text-xs"} onClick={() => setIsOpen("create")}>
            <Plus className="size-3.5" />
            Tambah Banner
          </Button>
        </div>
      </div>
      {list?.data && (
        <Accordion
          className={"border rounded-lg"}
          value={accordionValue}
          onValueChange={setAccordionValue}
        >
          {list?.data.palet_load.length > 0 && (
            <BannerCard
              value="palet-load"
              list={list?.data.palet_load ?? []}
              label="Palet Load"
              icon={Package}
              setIsOpen={setIsOpen}
              setBannerId={setBannerId}
              handleDelete={handleDelete}
              handleSort={handleSort}
              handleStatus={handleStatus}
              isLoading={isLoading}
            />
          )}
          {list.data.container_load.length > 0 && (
            <BannerCard
              value="container-load"
              list={list?.data.container_load ?? []}
              label="Container Load"
              icon={Container}
              setIsOpen={setIsOpen}
              setBannerId={setBannerId}
              handleDelete={handleDelete}
              handleSort={handleSort}
              handleStatus={handleStatus}
              isLoading={isLoading}
            />
          )}
          {list.data.truck_load.length > 0 && (
            <BannerCard
              value="truck-load"
              list={list?.data.truck_load ?? []}
              label="Truck Load"
              icon={Truck}
              setIsOpen={setIsOpen}
              setBannerId={setBannerId}
              handleDelete={handleDelete}
              handleSort={handleSort}
              handleStatus={handleStatus}
              isLoading={isLoading}
            />
          )}
        </Accordion>
      )}
    </div>
  );
};
