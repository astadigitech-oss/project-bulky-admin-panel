"use client";

import { useGetWholesalerConfigDetail } from "../_api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmailSection } from "./_section/email";

export const WholesalerMarketingClient = () => {
  const queryConfig = useGetWholesalerConfigDetail();

  return (
    <div className="flex flex-col gap-6 pt-4">
      <div className="flex items-center justify-between">
        <h1 className="leading-none font-semibold text-2xl">Formulir Grosir</h1>
      </div>
      <div className="grid grid-cols-2 gap-6">
        <div>
          <EmailSection
            key={queryConfig.data?.data.updated_at}
            queryConfig={queryConfig}
          />
        </div>
        <div>
          <Card>
            <CardHeader>
              <CardTitle>List Email</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center flex-wrap"></div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
