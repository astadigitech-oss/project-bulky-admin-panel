"use client";

import { TableIcon } from "lucide-react";

import { useToolbarContext } from "@/components/editor/context/toolbar-context";
import { InsertTableDialog } from "@/components/editor/plugins/table-plugin";
import { Button } from "@/components/ui/button";

export function InsertTable() {
  const { showModal } = useToolbarContext();

  return (
    <Button
      variant={"outline"}
      size={"icon"}
      onClick={(e) => {
        e.preventDefault();
        showModal("Insert Table", (onClose) => (
          <InsertTableDialog onCloseAction={onClose} />
        ));
      }}
    >
      <TableIcon className="size-4" />
    </Button>
  );
}
