"use client";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { VariantProps } from "class-variance-authority";
import React, { useState, JSX } from "react";

export const useConfirm = (
  title: string,
  message: string,
  variant: VariantProps<typeof buttonVariants>["variant"] = "default",
): [
  () => JSX.Element,
  (
    newValue?: string,
    oldValue?: string,
    variant?: VariantProps<typeof buttonVariants>["variant"],
  ) => Promise<unknown>,
] => {
  const [state, setPromise] = useState<{
    resolve: (value: boolean) => void;
    newValue?: string;
    oldValue?: string;
    variant?: VariantProps<typeof buttonVariants>["variant"];
  } | null>(null);

  const confirm = (
    newValue?: string,
    oldValue?: string,
    variant?: VariantProps<typeof buttonVariants>["variant"],
  ) => {
    return new Promise((resolve) => {
      setPromise({ resolve, newValue, oldValue, variant });
    });
  };

  const handleClose = () => {
    setPromise(null);
  };

  const handleConfirm = () => {
    state?.resolve(true);
    handleClose();
  };

  const handleCancel = () => {
    state?.resolve(false);
    handleClose();
  };

  const ConfirmationDialog = () => (
    <Dialog open={state !== null} onOpenChange={handleClose}>
      <DialogContent
        showCloseButton={false}
        className="w-full sm:max-w-lg border-none overflow-y-auto  hide-scrollbar max-w-[85vh]"
      >
        <DialogHeader className="p-0">
          <DialogTitle>
            {state?.oldValue && state?.newValue
              ? title.replace(`[${state?.oldValue}]`, state?.newValue)
              : title}
          </DialogTitle>
          <DialogDescription>{message}</DialogDescription>
        </DialogHeader>
        <div className="w-full pt-4 flex items-center flex-col gap-y-2 lg:flex-row gap-x-2 justify-end">
          <Button
            className="w-full lg:w-auto"
            variant={"outline"}
            onClick={handleCancel}
            type="button"
          >
            Cancel
          </Button>
          <Button
            className="w-full lg:w-auto"
            variant={state?.variant ?? variant}
            onClick={handleConfirm}
            type="button"
          >
            Confirm
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );

  return [ConfirmationDialog, confirm];
};
