"use client";

import Pagination from "@/components/pagination";
import { Button } from "@/components/ui/button";
import DataTable from "@/components/ui/data-table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { InputSearch } from "@/components/ui/input-search";
import { usePagination } from "@/hooks/use-pagination";
import { useSearchQuery } from "@/hooks/use-search";
import { useConfirm } from "@/hooks/use-confirm";
import { cn } from "@/lib/utils";
import { TooltipText } from "@/providers/tooltip-provider";
import { Plus, RefreshCw } from "lucide-react";
import { Lottie } from "lottie-react";
import { parseAsString, useQueryStates } from "nuqs";
import { useEffect, useState } from "react";
import {
  useDeleteAuctionEducationBanner,
  useDraftAuctionEducationBanner,
  useGetAuctionEducationBannerDetail,
  useGetAuctionEducationBannerList,
  useReorderAuctionEducationBanners,
  usePublishAuctionEducationBanner,
} from "../_api";
import { columns } from "./columns";
import { DialogFormAuctionEducationBanner } from "./_dialog/form";
import { AuctionEducationBanner } from "../_api/types";

type BannerToDelete = { id: string; nama: string };

const DeleteAuctionEducationBannerDialog = ({
  banner,
  isDeleting,
  onClose,
  onConfirm,
}: {
  banner: BannerToDelete | null;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) => (
  <Dialog
    open={banner !== null}
    onOpenChange={(isOpen) => {
      if (!isOpen && !isDeleting) onClose();
    }}
  >
    <DialogContent
      className="w-[min(36rem,calc(100vw-2rem))] gap-0 overflow-hidden p-0 sm:max-w-xl"
      showCloseButton={false}
    >
      <div className="grid items-center gap-5 px-6 py-6 sm:grid-cols-[172px_minmax(0,1fr)]">
        <div className="flex h-36 items-center justify-center overflow-hidden sm:justify-start">
          <Lottie
            src="/assets/lottie/delete-files-loop.json"
            loop
            autoplay
            className="h-40 w-44 -translate-y-5 scale-125"
            aria-label="Animasi penghapusan banner edukasi"
          />
        </div>
        <DialogHeader className="items-start gap-2 text-left">
          <DialogTitle>
            {isDeleting ? "Menghapus banner edukasi" : "Hapus banner edukasi?"}
          </DialogTitle>
          <DialogDescription className="max-w-sm text-left leading-relaxed">
            {isDeleting ? (
              "Banner sedang dihapus. Jangan tutup halaman ini."
            ) : (
              <>
                Banner{" "}
                <span className="font-medium text-foreground">
                  {banner?.nama}
                </span>{" "}
                akan diarsipkan dan tidak lagi tampil di storefront. Penghapusan
                ini tidak dapat dipulihkan dari panel admin.
              </>
            )}
          </DialogDescription>
        </DialogHeader>
      </div>
      {!isDeleting && (
        <div className="flex items-center justify-end gap-2 border-t bg-muted/30 px-6 py-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Batal
          </Button>
          <Button type="button" variant="destructive" onClick={onConfirm}>
            Hapus Banner
          </Button>
        </div>
      )}
    </DialogContent>
  </Dialog>
);

export const AuctionEducationBannerClient = () => {
  const [open, setOpen] = useState<"create" | "edit" | null>(null);
  const [{ bannerId }, setQuery] = useQueryStates(
    { bannerId: parseAsString.withDefault("") },
    { urlKeys: { bannerId: "id" } },
  );
  const [bannerToDelete, setBannerToDelete] = useState<BannerToDelete | null>(
    null,
  );
  const { search, searchValue, setSearch } = useSearchQuery();
  const { page, limit, metaPage, setPage, setLimit, setPaginationData } =
    usePagination();
  const {
    data: list,
    refetch,
    isRefetching,
    isLoading,
  } = useGetAuctionEducationBannerList({
    page,
    per_page: limit,
    search: searchValue,
  });
  const { data: detail } = useGetAuctionEducationBannerDetail({ id: bannerId });
  const { mutate: deleteBanner, isPending: isDeleting } =
    useDeleteAuctionEducationBanner();
  const { mutate: publishBanner, isPending: isPublishing } =
    usePublishAuctionEducationBanner();
  const { mutate: draftBanner, isPending: isDrafting } =
    useDraftAuctionEducationBanner();
  const [DialogPublish, confirmPublish] = useConfirm(
    "Publish banner",
    "Banner akan langsung ditayangkan di storefront.",
  );
  const [DialogDraft, confirmDraft] = useConfirm(
    "Jadikan draft",
    "Banner tidak akan lagi ditayangkan di storefront.",
    "destructive",
  );
  const { data: completeList } = useGetAuctionEducationBannerList({
    page: 1,
    per_page: 100,
  });
  const { mutate: reorderBanners, isPending: isReordering } =
    useReorderAuctionEducationBanners();
  const isDisabled = isDeleting || isReordering || isPublishing || isDrafting;

  useEffect(() => {
    if (!list) return;
    if (page > list.meta.last_page) {
      setPage(list.meta.last_page);
      return;
    }
    setPaginationData(list.meta);
  }, [list, page, setPage, setPaginationData]);

  const handleDelete = async (name: string, id: string) => {
    setBannerToDelete({ id, nama: name });
  };

  const deleteSelectedBanner = () => {
    if (!bannerToDelete) return;
    deleteBanner(
      { params: { id: bannerToDelete.id } },
      { onSuccess: () => setBannerToDelete(null) },
    );
  };

  const handleMove = (id: string, direction: "up" | "down") => {
    const ordered = completeList?.data ?? [];
    if (completeList?.meta.total !== ordered.length) return;
    const from = ordered.findIndex((item) => item.id === id);
    const to = from + (direction === "up" ? -1 : 1);
    if (from < 0 || to < 0 || to >= ordered.length) return;
    const ids = ordered.map((item) => item.id);
    [ids[from], ids[to]] = [ids[to], ids[from]];
    reorderBanners({ body: { ids } });
  };
  const handleStatus = async (banner: AuctionEducationBanner) => {
    const isPublished = banner.status === "published";
    const confirmed = isPublished
      ? await confirmDraft(banner.nama, "banner", "destructive")
      : await confirmPublish(banner.nama, "banner");
    if (!confirmed) return;
    const variables = { body: undefined, params: { id: banner.id } };
    if (isPublished) draftBanner(variables);
    else publishBanner(variables);
  };

  return (
    <div className="flex flex-col gap-6 pt-4">
      <DeleteAuctionEducationBannerDialog
        banner={bannerToDelete}
        isDeleting={isDeleting}
        onClose={() => setBannerToDelete(null)}
        onConfirm={deleteSelectedBanner}
      />
      <DialogPublish />
      <DialogDraft />
      <DialogFormAuctionEducationBanner
        open={!!open}
        mode={open}
        detail={detail?.data}
        isDisabled={isDisabled}
        onOpenChange={(value) => {
          if (!value) {
            setOpen(null);
            if (bannerId) setQuery({ bannerId: "" });
          }
        }}
      />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold leading-none">
          Banner Edukasi Lelang
        </h1>
        <div className="flex items-center gap-2">
          <InputSearch
            placeholder="Cari banner..."
            classNameWrap="w-60"
            value={search}
            setValue={setSearch}
          />
          <TooltipText
            value="Perbarui Data"
            render={
              <Button
                variant="outline"
                size="icon"
                disabled={isDisabled}
                onClick={() => refetch()}
              >
                <RefreshCw
                  className={cn("size-3.5", isRefetching && "animate-spin")}
                />
              </Button>
            }
          />
          <Button
            className="text-xs"
            onClick={() => setOpen("create")}
            disabled={isDisabled}
          >
            <Plus className="size-3.5" />
            Tambah Banner
          </Button>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <DataTable
          columns={columns({
            metaPage,
            setOpen,
            setQuery,
            handleDelete,
            handleMove,
            handleStatus,
            orderedIds: completeList?.data.map((item) => item.id) ?? [],
            canReorder: completeList?.meta.total === completeList?.data.length,
            disabled: isDisabled,
          })}
          data={list?.data ?? []}
          isInitialLoading={isLoading}
        />
        <Pagination
          pagination={{ ...metaPage, current_page: page, per_page: limit }}
          setPage={setPage}
          setLimit={setLimit}
          disabled={isDisabled}
        />
      </div>
    </div>
  );
};
