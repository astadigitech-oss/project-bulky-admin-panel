"use client";

import React from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select"; // Sesuaikan path importnya
import { MetaPagination } from "@/lib/types";
import { Separator } from "./ui/separator";

interface PaginationProps {
  pagination: MetaPagination;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  disabled?: boolean;
}

const Pagination = ({
  pagination,
  setPage,
  setLimit,
  disabled,
}: PaginationProps) => {
  return (
    <div className="flex items-center justify-between text-xs">
      {/* Bagian Per Page Selector */}
      <div className="flex items-center gap-3 text-xs">
        <p>
          Total{" "}
          <span className="text-foreground font-medium">
            {pagination.total.toLocaleString()}
          </span>{" "}
          data
        </p>
        <Separator orientation="vertical" className={"h-4 bg-white"} />
        <div className="flex gap-3 items-center">
          <p>Tampilkan</p>
          <Select
            value={pagination.per_page.toString()}
            onValueChange={(v) => setLimit(parseInt(v ?? "10"))}
            disabled={disabled}
          >
            <SelectTrigger className="w-fit h-8 border-0 bg-transparent shadow-none p-0 text-xs font-medium focus:ring-0 focus-visible:ring-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
          <p>per halaman</p>
        </div>
      </div>

      {/* Bagian Navigasi Halaman */}
      <div className="flex gap-5 items-center text-xs">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="size-8"
            size={"icon"}
            onClick={() => setPage(pagination.first_page)}
            disabled={pagination.current_page <= 1 || disabled}
          >
            <ChevronsLeft className="w-5 h-5" />
            <span className="sr-only">First Page</span>
          </Button>
          <Button
            variant="outline"
            className="size-8"
            size={"icon"}
            onClick={() => setPage(pagination.current_page - 1)}
            disabled={pagination.current_page <= 1 || disabled}
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="sr-only">Prev Page</span>
          </Button>

          <div className="flex items-center gap-1 w-32 justify-center">
            <span>Halaman {pagination.current_page.toLocaleString()}</span>
            <span>dari {pagination.last_page.toLocaleString()}</span>
          </div>

          <Button
            variant="outline"
            className="size-8"
            size={"icon"}
            onClick={() => setPage(pagination.current_page + 1)}
            disabled={
              pagination.current_page >= pagination.last_page || disabled
            }
          >
            <ChevronRight className="w-5 h-5" />
            <span className="sr-only">Next Page</span>
          </Button>
          <Button
            variant="outline"
            className="size-8"
            size={"icon"}
            onClick={() => setPage(pagination.last_page)}
            disabled={
              pagination.current_page >= pagination.last_page || disabled
            }
          >
            <ChevronsRight className="w-5 h-5" />
            <span className="sr-only">Last Page</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Pagination;
