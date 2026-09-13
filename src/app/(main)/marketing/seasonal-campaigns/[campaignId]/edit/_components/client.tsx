"use client";

import { useGetSeasonalCampaignDetail } from "@/app/(main)/marketing/seasonal-campaigns/_api";
import { SeasonalCampaignForm } from "@/app/(main)/marketing/seasonal-campaigns/_components/_dialog/form";
import { Skeleton } from "@/components/ui/skeleton";

export const EditSeasonalCampaignClient = ({ campaignId }: { campaignId: string }) => {
  const { data, isLoading } = useGetSeasonalCampaignDetail({ id: campaignId });
  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-4xl pt-4">
        <Skeleton className="h-10 w-72" />
        <Skeleton className="mt-6 h-[38rem] w-full" />
      </div>
    );
  }
  return <SeasonalCampaignForm mode="edit" detail={data?.data} />;
};
