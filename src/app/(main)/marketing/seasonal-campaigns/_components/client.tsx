"use client";

import DataTable from "@/components/ui/data-table";
import Pagination from "@/components/pagination";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { InputSearch } from "@/components/ui/input-search";
import { TooltipText } from "@/providers/tooltip-provider";
import { useConfirm } from "@/hooks/use-confirm";
import { usePagination } from "@/hooks/use-pagination";
import { useSearchQuery } from "@/hooks/use-search";
import { cn } from "@/lib/utils";
import { parseAsString, useQueryStates } from "nuqs";
import { Plus, RefreshCw } from "lucide-react";
import { Lottie } from "lottie-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  useCancelSeasonalCampaign,
  useDeleteSeasonalCampaign,
  useGetSeasonalCampaignList,
  usePublishSeasonalCampaign,
} from "../_api";
import { SeasonalCampaign } from "../_api/types";
import { column } from "./columns";

const DeleteCampaignDialog = ({ campaign, isDeleting, onClose, onConfirm }: {
  campaign: SeasonalCampaign | null;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) => (
  <Dialog open={campaign !== null} onOpenChange={(open) => { if (!open && !isDeleting) onClose(); }}>
    <DialogContent className="w-[min(36rem,calc(100vw-2rem))] gap-0 overflow-hidden p-0 sm:max-w-xl" showCloseButton={false}>
      <div className="grid items-center gap-5 px-6 py-6 sm:grid-cols-[172px_minmax(0,1fr)]">
        <div className="flex h-36 items-center justify-center overflow-hidden sm:justify-start">
          <Lottie src="/assets/lottie/delete-files-loop.json" loop autoplay className="h-40 w-44 -translate-y-5 scale-125" aria-label="Animasi penghapusan campaign" />
        </div>
        <DialogHeader className="items-start gap-2 text-left">
          <DialogTitle>{isDeleting ? "Menghapus campaign" : "Hapus campaign?"}</DialogTitle>
          <DialogDescription className="max-w-sm text-left leading-relaxed">
            {isDeleting
              ? "Campaign sedang dihapus. Jangan tutup halaman ini."
              : <>Campaign <span className="font-medium text-foreground">{campaign?.nama}</span> akan dihapus. Aset terkait juga dihapus dari storage dan tindakan ini tidak dapat dibatalkan.</>}
          </DialogDescription>
        </DialogHeader>
      </div>
      {!isDeleting && <div className="flex items-center justify-end gap-2 border-t bg-muted/30 px-6 py-4">
        <Button type="button" variant="outline" onClick={onClose}>Batal</Button>
        <Button type="button" variant="destructive" onClick={onConfirm}>Hapus campaign</Button>
      </div>}
    </DialogContent>
  </Dialog>
);

export const SeasonalCampaignClient = () => {
  const router = useRouter();
  const [{ sort, order }] = useQueryStates({
    sort: parseAsString.withDefault("created_at"),
    order: parseAsString.withDefault("desc"),
  });
  const { search, searchValue, setSearch } = useSearchQuery();
  const { page, limit, metaPage, setPage, setLimit, setPaginationData } = usePagination();
  const { data: list, refetch, isLoading, isRefetching } = useGetSeasonalCampaignList({ page, per_page: limit, search: searchValue, sort_by: sort, order: order as "asc" | "desc" });
  const { mutate: deleteCampaign, isPending: isDeleting } = useDeleteSeasonalCampaign();
  const { mutate: publishCampaign, isPending: isPublishing } = usePublishSeasonalCampaign();
  const { mutate: cancelCampaign, isPending: isCancelling } = useCancelSeasonalCampaign();
  const [DialogPublish, confirmPublish] = useConfirm("Publish [campaign]", "Campaign akan mulai diterapkan sesuai periode yang ditetapkan.");
  const [DialogStop, confirmStop] = useConfirm("Hentikan [campaign]", "Campaign tidak lagi diterapkan. Aset dan data campaign tetap tersimpan dan dapat dipublish kembali.", "destructive");
  const [campaignToDelete, setCampaignToDelete] = useState<SeasonalCampaign | null>(null);
  const disabled = isRefetching || isDeleting || isPublishing || isCancelling;

  useEffect(() => {
    if (!list) return;
    if (page > list.meta.last_page) { setPage(list.meta.last_page); return; }
    setPaginationData(list.meta);
  }, [list]);

  const confirmLifecycle = async (campaign: SeasonalCampaign, action: "publish" | "cancel") => {
    const confirmed = action === "publish"
      ? await confirmPublish(campaign.nama, "campaign")
      : await confirmStop(campaign.nama, "campaign", "destructive");
    if (!confirmed) return;
    const variables = { body: undefined, params: { id: campaign.id } };
    if (action === "publish") publishCampaign(variables);
    else cancelCampaign(variables);
  };

  const handleDelete = async (campaign: SeasonalCampaign) => {
    setCampaignToDelete(campaign);
  };

  const deleteSelectedCampaign = () => {
    if (!campaignToDelete) return;
    deleteCampaign(
      { body: undefined, params: { id: campaignToDelete.id } },
      { onSuccess: () => setCampaignToDelete(null) },
    );
  };

  return (
    <div className="flex flex-col gap-6 pt-4">
      <DeleteCampaignDialog campaign={campaignToDelete} isDeleting={isDeleting} onClose={() => setCampaignToDelete(null)} onConfirm={deleteSelectedCampaign} />
      <DialogPublish /><DialogStop />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="leading-none font-semibold text-2xl">Campaign Seasonal</h1><p className="mt-1 text-sm text-muted-foreground">Kelola warna dan asset branding musiman untuk web serta mobile.</p></div>
        <div className="flex items-center gap-2">
          <InputSearch placeholder="Cari campaign..." classNameWrap="w-60" value={search} setValue={setSearch} />
          <TooltipText value="Perbarui data" render={<Button variant="outline" size="icon" disabled={disabled} onClick={() => refetch()}><RefreshCw className={cn("size-3.5", isRefetching && "animate-spin")} /></Button>} />
          <Button className="text-xs" disabled={disabled} onClick={() => router.push("/marketing/seasonal-campaigns/create")}><Plus className="size-3.5" />Tambah Campaign</Button>
        </div>
      </div>
      <DataTable columns={column({ metaPage, onEdit: (campaign) => router.push(`/marketing/seasonal-campaigns/${campaign.id}/edit`), onDelete: handleDelete, onPublish: (campaign) => confirmLifecycle(campaign, "publish"), onCancel: (campaign) => confirmLifecycle(campaign, "cancel"), disabled })} data={list?.data ?? []} isInitialLoading={isLoading} />
      <Pagination pagination={{ ...metaPage, current_page: page, per_page: limit }} setPage={setPage} setLimit={setLimit} disabled={disabled} />
    </div>
  );
};
