import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { TooltipText } from "@/providers/tooltip-provider";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import {
  ArrowDown,
  ArrowUp,
  Circle,
  CircleDot,
  Clock,
  Edit,
  Eye,
  MoreHorizontal,
  Trash,
} from "lucide-react";
import { MetaPagination } from "@/lib/types";
import { Dispatch, SetStateAction } from "react";
import { VariantProps } from "class-variance-authority";
import { FAQsType } from "../_api/types";
import GB from "country-flag-icons/react/3x2/GB";
import ID from "country-flag-icons/react/3x2/ID";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export const column = ({
  setOpen,
  metaPage,
  setQuery,
  handleDelete,
  handleChangeStatus,
  disabled,
  handleReorder,
}: {
  setOpen: Dispatch<SetStateAction<"edit" | "create" | null>>;
  metaPage: MetaPagination;
  setQuery: any;
  disabled: boolean;
  handleReorder: (id: string, direction: "up" | "down") => void;
  handleDelete: (user: string, userId: string) => Promise<void>;
  handleChangeStatus: (
    command: string,
    userId: string,
    variant: VariantProps<typeof buttonVariants>["variant"],
  ) => Promise<void>;
}): ColumnDef<FAQsType>[] => [
  {
    id: "id",
    header: () => <div className="text-center">No</div>,
    cell: ({ row }) => (
      <div className="text-center tabular-nums">
        {(metaPage.from + row.index).toLocaleString()}
      </div>
    ),
  },
  {
    accessorKey: "question",
    header: () => (
      <div className="flex items-center gap-2">
        Pertanyaan <ID className="h-3 aspect-3/2 rounded shadow" />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <p>{row.original.question}</p>
        <DialogPriview
          label="Pratinjau"
          question={row.original.question}
          answer={row.original.answer}
        />
      </div>
    ),
  },
  {
    accessorKey: "question_en",
    header: () => (
      <div className="flex items-center gap-2">
        Pertanyaan <GB className="h-3 aspect-3/2 rounded shadow" />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <p>{row.original.question_en}</p>
        <DialogPriview
          label="Preview"
          question={row.original.question_en}
          answer={row.original.answer_en}
        />
      </div>
    ),
  },
  {
    accessorKey: "urutan",
    header: "Urutan",
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => (
      <div
        className={cn(
          "flex items-center gap-2 text-xs bg-green-500/20 px-2 py-0.5 rounded-full font-medium w-fit",
          row.original.is_active
            ? "bg-green-500/20 dark:bg-green-500/30 dark:text-emerald-100 text-emerald-600"
            : "bg-red-500/10 dark:bg-red-500/30 dark:text-red-200 text-red-600",
        )}
      >
        <div
          className={cn(
            "size-2 rounded-full",
            row.original.is_active ? "bg-green-500" : "bg-red-500",
          )}
        />
        {row.original.is_active ? "Aktif" : "Tidak Aktif"}
      </div>
    ),
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <TooltipText
          value={
            <div className="flex flex-col gap-2">
              <div className="flex flex-col">
                <div className="text-xs">Di update:</div>
                <div className="text-xs font-semibold">
                  {format(row.original.updated_at, "PPpp", { locale: id })}
                </div>
              </div>
            </div>
          }
          render={
            <Button variant={"ghost"} size={"icon-xs"}>
              <Clock />
            </Button>
          }
        />
        <DropdownMenu>
          <DropdownMenuTrigger
            disabled={disabled}
            className={buttonVariants({ size: "icon-xs", variant: "ghost" })}
          >
            <MoreHorizontal />
            <span className="sr-only">toggle action</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent className={"w-auto"}>
            <DropdownMenuGroup>
              <DropdownMenuLabel>Aksi</DropdownMenuLabel>
              <DropdownMenuItem
                className={"text-xs"}
                disabled={row.original.urutan === 1}
                onClick={() => handleReorder(row.original.id, "up")}
              >
                <ArrowUp className="size-3.5" />
                Naikan Urutan
              </DropdownMenuItem>
              <DropdownMenuItem
                className={"text-xs"}
                onClick={() => handleReorder(row.original.id, "down")}
              >
                <ArrowDown className="size-3.5" />
                Turunkan Urutan
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className={"text-xs"}
                onClick={() =>
                  handleChangeStatus(
                    row.original.is_active
                      ? `Nonaktifkan ${row.original.question}`
                      : `Aktifkan ${row.original.question}`,
                    row.original.id,
                    row.original.is_active ? "destructive" : "default",
                  )
                }
              >
                {row.original.is_active ? (
                  <Circle className="size-3.5" />
                ) : (
                  <CircleDot className="size-3.5" />
                )}
                {row.original.is_active ? "Nonaktifkan" : "Aktifkan"}
              </DropdownMenuItem>
              <DropdownMenuItem
                className={"text-xs"}
                onClick={() => {
                  setOpen("edit");
                  setQuery({ faqId: row.original.id });
                }}
              >
                <Edit className="size-3.5" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                className={"text-xs"}
                onClick={() =>
                  handleDelete(row.original.question, row.original.id)
                }
                variant="destructive"
              >
                <Trash className="size-3.5" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),
  },
];

const DialogPriview = ({
  label,
  question,
  answer,
}: {
  label: string;
  question: string;
  answer: string;
}) => {
  return (
    <Dialog>
      <TooltipText
        value={label}
        render={
          <DialogTrigger
            render={
              <Button variant={"ghost"} size={"icon-sm"} type="button">
                <Eye className="size-3.5 stroke-[1.25]" />
              </Button>
            }
          />
        }
      />
      <DialogContent
        className={"p-0 gap-0 overflow-hidden min-w-md"}
        showCloseButton={false}
      >
        <div className="bg-gray-100 p-4 border-b">
          <DialogHeader>
            <DialogTitle className={"flex items-center gap-2"}>
              <p>FAQ {label}</p>
              <ID className="h-3 aspect-3/2 rounded shadow" />
            </DialogTitle>
          </DialogHeader>
        </div>
        <div className="text-sm leading-relaxed flex flex-col gap-1 p-4">
          <p className="font-medium">{question}</p>
          <p className="text-gray-500">{answer}</p>
        </div>
        <DialogFooter className="m-0">
          <DialogClose render={<Button>Close</Button>} />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
