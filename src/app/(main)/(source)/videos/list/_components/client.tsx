"use client";

import { InputSearch } from "@/components/ui/input-search";
import { useSearchQuery } from "@/hooks/use-search";
import { parseAsString, useQueryStates } from "nuqs";
import { usePagination } from "@/hooks/use-pagination";
import { useEffect, useState } from "react";
import DataTable from "@/components/ui/data-table";
import Pagination from "@/components/pagination";
import { Button, buttonVariants } from "@/components/ui/button";
import { TooltipText } from "@/providers/tooltip-provider";
import { Plus, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { SortTable } from "@/components/sort-table";
import { column } from "./columns";
import {
  useDeleteVideo,
  useGetVideoDetail,
  useGetVideoList,
  useToggleStatusVideo,
} from "../_api";
import { useConfirm } from "@/hooks/use-confirm";
import { VariantProps } from "class-variance-authority";
import { DialogFormVideo } from "./_dialog/form";

export const VideoListClient = () => {
  const [open, setOpen] = useState<"edit" | "create" | null>(null);

  const [{ sort, order, videoId }, setQuery] = useQueryStates(
    {
      videoId: parseAsString.withDefault(""),
      sort: parseAsString.withDefault("published_at"),
      order: parseAsString.withDefault("desc"),
    },
    { urlKeys: { videoId: "id" } },
  );

  const { search, searchValue, setSearch } = useSearchQuery();
  const { page, limit, metaPage, setPage, setLimit, setPaginationData } =
    usePagination();

  const [DialogDelete, confirmDelete] = useConfirm(
    "Hapus [name]",
    "Apakah anda yakin? tindakan ini bersifat permanen",
    "destructive",
  );

  const [DialogStatus, confirmStatus] = useConfirm(
    "[command]",
    "Tindakan tidak bersifat permanen, anda dapat mengubahnya lagi lain kali",
  );

  const { mutate: deleteVideo, isPending: isDeleting } = useDeleteVideo();
  const { mutate: updateStatus, isPending: isUpdatingStatus } =
    useToggleStatusVideo();

  const {
    data: list,
    refetch,
    isRefetching,
    isLoading: isLoadList,
  } = useGetVideoList({
    page,
    per_page: limit,
    search: searchValue,
    sort_by: sort,
    order: order as "asc" | "desc",
  });

  const { data: detail } = useGetVideoDetail({ id: videoId });

  const isDisabled = isDeleting || isUpdatingStatus;

  const handleDelete = async (title: string, id: string) => {
    const ok = await confirmDelete(title, "name");
    if (!ok) return;
    deleteVideo({ params: { id } });
  };

  const handleChangeStatus = async (
    command: string,
    id: string,
    variant: VariantProps<typeof buttonVariants>["variant"],
  ) => {
    const ok = await confirmStatus(command, "command", variant);
    if (!ok) return;
    updateStatus({ params: { id } });
  };

  useEffect(() => {
    if (list) {
      if (page > list.meta.last_page) {
        setPage(list.meta.last_page);
        return;
      }
      setPaginationData(list.meta);
    }
  }, [list]);

  const activeCount = (list?.data ?? []).filter((i) => i.is_active).length;

  return (
    <div className="flex flex-col gap-6 pt-4">
      <DialogDelete />
      <DialogStatus />
      <DialogFormVideo
        open={!!open}
        onOpenChange={(e) => {
          if (!e) {
            setOpen(null);
            if (videoId) setQuery({ videoId: "" });
          }
        }}
        mode={open}
        detail={detail?.data}
        isDisabled={isDisabled}
      />
      <div className="flex items-center justify-between">
        <h1 className="leading-none font-semibold text-2xl">List Video</h1>
        <div className="flex items-center gap-2">
          <InputSearch
            placeholder="Cari video..."
            classNameWrap="w-60"
            value={search}
            setValue={setSearch}
          />
          <TooltipText
            value="Perbarui Data"
            render={
              <Button
                variant={"outline"}
                size={"icon"}
                disabled={isDisabled}
                onClick={() => refetch()}
              >
                <RefreshCw className={cn("size-3.5", isRefetching && "animate-spin")} />
              </Button>
            }
          />
          <SortTable
            data={[]}
            order={order}
            sort={sort}
            setSort={setQuery}
            disabled={isDisabled}
          />
          <Button className={"text-xs"} onClick={() => setOpen("create")} disabled={isDisabled}>
            <Plus className="size-3.5" />
            Tambah Video
          </Button>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-lg border p-4">
          <div className="text-muted-foreground text-xs">Total Video (page ini)</div>
          <div className="text-xl font-semibold">{list?.data.length ?? 0}</div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-muted-foreground text-xs">Total Data Video</div>
          <div className="text-xl font-semibold">{list?.meta.total ?? 0}</div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-muted-foreground text-xs">Video Aktif (page ini)</div>
          <div className="text-xl font-semibold">{activeCount}</div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <DataTable
          columns={column({
            metaPage,
            disabled: isDisabled,
            setOpen,
            setQuery,
            handleDelete,
            handleChangeStatus,
          })}
          data={list?.data ?? []}
          isInitialLoading={isLoadList}
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
