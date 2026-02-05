import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Spinner } from "@/components/ui/spinner";
import { ArrowDown, ArrowUp, Edit2, Trash } from "lucide-react";
import React from "react";

export const ItemData = ({
  label,
  handleUp,
  handleDown,
  handleDelete,
  handleEdit,
  isDisabled,
  isDisabledUp,
  isDisabledDown,
}: {
  label: string;
  handleUp: () => void;
  handleDown: () => void;
  handleDelete: () => void;
  handleEdit: () => void;
  isDisabled: boolean;
  isDisabledUp: boolean;
  isDisabledDown: boolean;
}) => {
  return (
    <div className="flex items-center justify-between gap-4 w-full border-b last:border-0 border-gray-300 dark:border-gray-500/50 h-10 pl-5 pr-1">
      <p className="h-8 text-xs items-center flex whitespace-pre-wrap relative before:content-[''] before:absolute before:-left-2.5 before:w-1 before:h-6 before:rounded-full before:bg-yellow-400">
        {label}
      </p>
      <ButtonGroup className="[&>[data-slot]:not(:has(~[data-slot]))]:rounded-r-md!">
        <Button
          variant={"ghost"}
          size={"icon-sm"}
          className={"rounded-l-md!"}
          disabled={isDisabledUp || isDisabled}
          onClick={handleUp}
        >
          {isDisabled ? (
            <Spinner className="size-3.5" />
          ) : (
            <ArrowUp className="size-3.5" />
          )}
        </Button>
        <Button
          variant={"ghost"}
          size={"icon-sm"}
          disabled={isDisabledDown || isDisabled}
          onClick={handleDown}
        >
          {isDisabled ? (
            <Spinner className="size-3.5" />
          ) : (
            <ArrowDown className="size-3.5" />
          )}
        </Button>
        <Button
          variant={"ghost"}
          type="button"
          size={"icon-sm"}
          onClick={handleEdit}
        >
          {isDisabled ? (
            <Spinner className="size-3.5" />
          ) : (
            <Edit2 className="size-3.5" />
          )}
        </Button>
        <Button
          variant={"ghostDestructive"}
          size={"icon-sm"}
          className={"rounded-r-md!"}
          onClick={handleDelete}
        >
          {isDisabled ? (
            <Spinner className="size-3.5" />
          ) : (
            <Trash className="size-3.5" />
          )}
        </Button>
      </ButtonGroup>
    </div>
  );
};
