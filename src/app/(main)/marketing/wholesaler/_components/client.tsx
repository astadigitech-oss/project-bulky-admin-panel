"use client";

import { useSidebar } from "@/components/ui/sidebar";
import {
  useGetWholesalerAnggaranList,
  useGetWholesalerConfigDetail,
} from "../_api";
import { AnggaranSection } from "./_section/anggaran";
import { EmailSection } from "./_section/email";
import { cn } from "@/lib/utils";

export const WholesalerMarketingClient = () => {
  const { open } = useSidebar();
  const queryConfig = useGetWholesalerConfigDetail();
  const queryAnggaran = useGetWholesalerAnggaranList();

  return (
    <div className="flex flex-col gap-6 pt-4">
      <div className="flex items-center justify-between">
        <h1 className="leading-none font-semibold text-2xl">Formulir Grosir</h1>
      </div>
      <div
        className={cn(
          "grid gap-6",
          open ? "grid-cols-1 xl:grid-cols-2" : "grid-cols-1 lg:grid-cols-2",
        )}
      >
        <div>
          <EmailSection
            key={queryConfig.data?.data.updated_at}
            queryConfig={queryConfig}
          />
        </div>
        <div>
          <AnggaranSection
            key={JSON.stringify(queryAnggaran.data?.data)}
            queryAnggaran={queryAnggaran}
          />
        </div>
      </div>
    </div>
  );
};
