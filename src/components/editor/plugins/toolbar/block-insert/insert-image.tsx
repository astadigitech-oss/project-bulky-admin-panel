"use client";

import { ImageIcon } from "lucide-react";

import { useToolbarContext } from "@/components/editor/context/toolbar-context";
import { InsertImageDialog } from "@/components/editor/plugins/images-plugin";
import { Button } from "@/components/ui/button";

export function InsertImage() {
  const { showModal } = useToolbarContext();

  return (
    <Button
      variant={"outline"}
      size={"icon"}
      onClick={(e) => {
        e.preventDefault();
        showModal("Insert Image", (onClose) => (
          <InsertImageDialog onCloseAction={onClose} />
        ));
      }}
    >
      <ImageIcon className="size-4" />
    </Button>
  );
}
