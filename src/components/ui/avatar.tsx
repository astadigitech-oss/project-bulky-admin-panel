"use client";

import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";

import { cn, sizesImage } from "@/lib/utils";
import Image from "next/image";

function Avatar({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root>) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      className={cn(
        "relative flex size-8 shrink-0 overflow-hidden rounded-full",
        className,
      )}
      {...props}
    />
  );
}

function AvatarImage({
  className,
  classNameWrap,
  alt,
  ...props
}: React.ComponentProps<typeof Image> & { classNameWrap?: string }) {
  return (
    <div className={cn("size-8 border relative", classNameWrap)}>
      <Image
        data-slot="avatar-image"
        className={cn("object-cover", className)}
        fill
        sizes={sizesImage}
        alt={alt}
        {...props}
      />
    </div>
  );
}

function AvatarFallback({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        "bg-muted flex size-full items-center justify-center rounded-full",
        className,
      )}
      {...props}
    />
  );
}

export { Avatar, AvatarImage, AvatarFallback };
