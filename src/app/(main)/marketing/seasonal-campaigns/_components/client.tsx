"use client";

import DataTable from "@/components/ui/data-table";
import Pagination from "@/components/pagination";
import { Button, buttonVariants } from "@/components/ui/button";
import { InputSearch } from "@/components/ui/input-search";
import { TooltipText } from "@/providers/tooltip-provider";
import { useConfirm } from "@/hooks/use-confirm";
import { usePagination } from "@/hooks/use-pagination";
import { useSearchQuery } from "@/hooks/use-search";
import { cn } from "@/lib/utils";
import { parseAsString, useQueryStates } from "nuqs";
import { Plus, RefreshCw } from "lucide-react";
import { useEffect } from "react";
import { VariantProps } from "class-variance-authority";
import { useRouter } from "next/navigation";
import {
  useCancelSeasonalCampaign,
  useDeleteSeasonalCampaign,
  useGetSeasonalCampaignList,
  usePublishSeasonalCampaign,
} from "../_api";
import { SeasonalCampaign } from "../_api/types";
import { column } from "./columns";

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
  const [DialogDelete, confirmDelete] = useConfirm("Hapus campaign", "Draft atau campaign yang telah dibatalkan akan dihapus secara soft delete.", "destructive");
  const [DialogAction, confirmAction] = useConfirm("[command]", "Pastikan periode dan asset campaign sudah benar.");
  const disabled = isRefetching || isDeleting || isPublishing || isCancelling;

  useEffect(() => {
    if (!list) return;
    if (page > list.meta.last_page) { setPage(list.meta.last_page); return; }
    setPaginationData(list.meta);
  }, [list]);

  const confirmLifecycle = async (campaign: SeasonalCampaign, action: "publish" | "cancel") => {
    const command = action === "publish" ? `Publish ${campaign.nama}` : `Batalkan ${campaign.nama}`;
    const variant: VariantProps<typeof buttonVariants>["variant"] = action === "cancel" ? "destructive" : "default";
    if (!(await confirmAction(command, "command", variant))) return;
    const variables = { body: undefined, params: { id: campaign.id } };
    if (action === "publish") publishCampaign(variables);
    else cancelCampaign(variables);
  };

  const handleDelete = async (campaign: SeasonalCampaign) => {
    if (!(await confirmDelete(campaign.nama, "campaign"))) return;
    deleteCampaign({ body: undefined, params: { id: campaign.id } });
  };

  return (
    <div className="flex flex-col gap-6 pt-4">
      <DialogDelete /><DialogAction />
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
