"use client";

import { parseAsString, useQueryStates } from "nuqs";
import React, { useEffect } from "react";
import { toast } from "sonner";

export const DashboardTransactionClient = () => {
  const [{ fromUrl }, setQuery] = useQueryStates({
    fromUrl: parseAsString.withDefault(""),
  });

  useEffect(() => {
    if (fromUrl === "login") {
      toast.success("Anda telah login");
      setTimeout(() => setQuery({ fromUrl: "" }, { history: "replace" }), 500);
    }
  }, [fromUrl, setQuery]);

  return <div></div>;
};
