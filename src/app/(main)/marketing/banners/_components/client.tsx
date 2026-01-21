"use client";

import { RefreshCw } from "lucide-react";
import { useSearchQuery } from "@/hooks/use-search";
import { InputSearch } from "@/components/ui/input-search";
import { SortTable } from "@/components/sort-table";
import { parseAsString, useQueryStates } from "nuqs";
import { Button } from "@/components/ui/button";
import { TooltipText } from "@/providers/tooltip-provider";
import DataTable from "@/components/ui/data-table";
import { column } from "./columns";
import Pagination from "@/components/pagination";
import { usePagination } from "@/hooks/use-pagination";
import { cn } from "@/lib/utils";
import { useConfirm } from "@/hooks/use-confirm";

export const BannerMarketingClient = () => {
  const [{ sort, order }, setQuery] = useQueryStates({
    sort: parseAsString.withDefault("created_at"),
    order: parseAsString.withDefault("desc"),
  });

  const [DialogDelete, confirmDelete] = useConfirm(
    "Delete [user]",
    "Apakah anda yakin? tindakan ini bersifat permanen",
    "destructive",
  );

  // const { mutate: deleteBuyer, isPending: isDeleting } = useDeleteBuyer();

  const { search, setSearch } = useSearchQuery();
  const { page, limit, metaPage, setPage, setLimit } = usePagination();
  // const {
  //   data: list,
  //   refetch,
  //   isRefetching,
  //   isLoading: isLoadList,
  // } = useGetBuyerList({
  //   page,
  //   per_page: limit,
  //   search,
  //   sort_by: sort,
  //   order: order as "asc" | "desc",
  // });

  const buyerList: any[] =
    // list?.data ??
    [];

  // const isDisabled = isDeleting || isLoadList;

  const handleDelete = async (user: string, userId: string) => {
    const ok = await confirmDelete(user, "user");
    if (!ok) return;
    console.log(userId);
    // deleteBuyer({ params: { id: userId } });
  };

  // useEffect(() => {
  //   if (list) {
  //     if (page > list.meta.last_page) {
  //       setPage(list.meta.last_page);
  //       return;
  //     }
  //     setPaginationData(list.meta);
  //   }
  // }, [list]);

  return (
    <div className="flex flex-col gap-6 pt-4">
      <DialogDelete />
      <div className="flex items-center justify-between gap-4">
        <h1 className="leading-none font-semibold text-2xl">Banner Promosi</h1>
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
                variant={"outline"}
                size={"icon"}
                // disabled={isDisabled || isRefetching}
                // onClick={() => refetch()}
              >
                <RefreshCw
                  className={cn(
                    "size-3.5",
                    // isRefetching && "animate-spin"
                  )}
                />
              </Button>
            }
          />
          <SortTable
            // disabled={isDisabled}
            data={[]}
            order={order}
            sort={sort}
            setSort={setQuery}
          />
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <DataTable
          columns={column({ handleDelete, metaPage, isDisabled: false })}
          data={buyerList}
          isInitialLoading={false}
        />
        <Pagination
          pagination={{ ...metaPage, current_page: page, per_page: limit }}
          setPage={setPage}
          setLimit={setLimit}
          // disabled={isDisabled}
        />
      </div>
    </div>
  );
};
