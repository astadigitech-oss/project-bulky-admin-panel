"use client";

import Pagination from "@/components/pagination";
import { SortTable } from "@/components/sort-table";
import { Button } from "@/components/ui/button";
import DataTable from "@/components/ui/data-table";
import { InputSearch } from "@/components/ui/input-search";
import { usePagination } from "@/hooks/use-pagination";
import { useSearchQuery } from "@/hooks/use-search";
import { cn } from "@/lib/utils";
import { TooltipText } from "@/providers/tooltip-provider";
import { Plus, RefreshCw } from "lucide-react";
import Link from "next/link";
import { parseAsString, useQueryStates } from "nuqs";
import React, { useEffect } from "react";
import { column } from "./columns";
import {
  useChangeStatusProduct,
  useDeleteProduct,
  useGetProductList,
} from "@api/product/list";
import { useConfirm } from "@/hooks/use-confirm";

export const ProductClient = () => {
  const [{ sort, order }, setQuery] = useQueryStates({
    sort: parseAsString.withDefault("created_at"),
    order: parseAsString.withDefault("desc"),
  });
  const [DialogDelete, confirmDelete] = useConfirm(
    "Hapus [name]",
    "Apakah anda yakin? tindakan ini bersifat permanen",
    "destructive",
  );
  const [DialogChangeStatus, confirmChangeStatus] = useConfirm(
    "[command]",
    "Tindakan tidak bersifat permanen, anda dapat mengubahnya lagi lain kali",
  );

  const { mutate: deleteProduct, isPending: isDeleting } = useDeleteProduct();
  const { mutate: changeStatusProduct, isPending: isUpdating } =
    useChangeStatusProduct();

  const { search, searchValue, setSearch } = useSearchQuery();
  const { page, limit, metaPage, setPage, setLimit, setPaginationData } =
    usePagination();
  const {
    data: list,
    refetch,
    isRefetching,
    isPending,
    isLoading: isLoadList,
  } = useGetProductList({
    page,
    per_page: limit,
    search: searchValue,
    sort_by: sort,
    order: order as "asc" | "desc",
  });

  const productList = list?.data ?? [];

  const isDisabled = isDeleting || isUpdating || isPending;

  const handleDelete = async (id: string, value: string) => {
    const ok = await confirmDelete(value, "name");
    if (!ok) return;
    deleteProduct({ params: { id } });
  };

  const handleChanngeStatus = async (
    id: string,
    value: string,
    status: boolean,
  ) => {
    const ok = await confirmChangeStatus(
      `${status ? "Publish" : "Draft"} ${value}`,
      "command",
      status ? "default" : "destructive",
    );
    if (!ok) return;
    changeStatusProduct({ params: { id } });
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

  return (
    <div className="flex flex-col gap-6 pt-4">
      <DialogDelete />
      <DialogChangeStatus />
      <div className="flex items-center justify-between">
        <h1 className="leading-none font-semibold text-2xl">Daftar Produk</h1>
        <div className="flex items-center gap-2">
          <InputSearch
            placeholder="Cari produk..."
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
                <RefreshCw
                  className={cn("size-3.5", isRefetching && "animate-spin")}
                />
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
          <Link href="/products/list/create">
            <Button className={"text-xs"} disabled={isDisabled}>
              <Plus className="size-3.5" />
              Tambah Produk
            </Button>
          </Link>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <DataTable
          columns={column({
            metaPage,
            handleDelete,
            handleChanngeStatus,
            isDisabled,
          })}
          data={productList}
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
