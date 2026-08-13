import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { TooltipText } from "@/providers/tooltip-provider";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";
import { MetaPagination } from "@/lib/types";
import {
  ForwarderCityType,
  ForwarderSubdistrictType,
} from "../_api/types";

export const columnCity = ({
  metaPage,
}: {
  metaPage: MetaPagination;
}): ColumnDef<ForwarderCityType>[] => [
  {
    id: "no",
    header: () => <div className="text-center">No</div>,
    cell: ({ row }) => (
      <div className="text-center tabular-nums">
        {(metaPage.from + row.index).toLocaleString()}
      </div>
    ),
  },
  {
    accessorKey: "kota_pattern",
    header: "Pattern",
    cell: ({ row }) => (
      <span className="font-medium">{row.original.kota_pattern}</span>
    ),
  },
  {
    accessorKey: "forwarder_city_name",
    header: "Nama Kota (Forwarder)",
  },
  {
    accessorKey: "forwarder_city_id",
    header: () => <div className="text-center">ID Forwarder</div>,
    cell: ({ row }) => (
      <div className="text-center tabular-nums">
        {row.original.forwarder_city_id}
      </div>
    ),
  },
  {
    id: "updated_at",
    header: () => <div className="text-center">Diperbarui</div>,
    cell: ({ row }) => (
      <div className="flex justify-center">
        <TooltipText
          value={
            <div className="flex flex-col gap-1">
              <div className="text-xs">Di update:</div>
              <div className="text-xs font-semibold">
                {format(row.original.updated_at, "PPpp", { locale: id })}
              </div>
            </div>
          }
          render={
            <Button variant={"ghost"} size={"icon-xs"}>
              <Clock />
            </Button>
          }
        />
      </div>
    ),
  },
];

export const columnSubdistrict = ({
  metaPage,
}: {
  metaPage: MetaPagination;
}): ColumnDef<ForwarderSubdistrictType>[] => [
  {
    id: "no",
    header: () => <div className="text-center">No</div>,
    cell: ({ row }) => (
      <div className="text-center tabular-nums">
        {(metaPage.from + row.index).toLocaleString()}
      </div>
    ),
  },
  {
    accessorKey: "kecamatan_pattern",
    header: "Pattern",
    cell: ({ row }) => (
      <span className="font-medium">{row.original.kecamatan_pattern}</span>
    ),
  },
  {
    accessorKey: "forwarder_subdistrict_name",
    header: "Nama Kecamatan (Forwarder)",
  },
  {
    accessorKey: "forwarder_city_id",
    header: () => <div className="text-center">ID Kota</div>,
    cell: ({ row }) => (
      <div className="text-center tabular-nums">
        {row.original.forwarder_city_id}
      </div>
    ),
  },
  {
    accessorKey: "forwarder_subdistrict_id",
    header: () => <div className="text-center">ID Kecamatan</div>,
    cell: ({ row }) => (
      <div className="text-center tabular-nums">
        {row.original.forwarder_subdistrict_id}
      </div>
    ),
  },
  {
    id: "updated_at",
    header: () => <div className="text-center">Diperbarui</div>,
    cell: ({ row }) => (
      <div className="flex justify-center">
        <TooltipText
          value={
            <div className="flex flex-col gap-1">
              <div className="text-xs">Di update:</div>
              <div className="text-xs font-semibold">
                {format(row.original.updated_at, "PPpp", { locale: id })}
              </div>
            </div>
          }
          render={
            <Button variant={"ghost"} size={"icon-xs"}>
              <Clock />
            </Button>
          }
        />
      </div>
    ),
  },
];
