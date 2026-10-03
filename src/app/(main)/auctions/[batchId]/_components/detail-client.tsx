"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useMe } from "@/components/container/_api";
import { useDuplicateAuction, useGetAuctionDetail } from "../../_api";
import { ArrowLeft, Copy, Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { auctionStatusVariant } from "../../list/_components/columns";
import { BidTab } from "./bid-tab";
import { DetailTab } from "./detail-tab";
import { AuctionDisplayControl } from "./auction-display-control";
import { AuctionStatusControl } from "./auction-status-control";

export const AuctionDetailClient = ({ batchId }: { batchId: string }) => {
  const { data: meData } = useMe();
  const permissions = meData?.data?.permissions ?? [];
  const canManage = permissions.includes("auction:manage");
  const router = useRouter();
  const { mutate: duplicateAuction, isPending: isDuplicating } = useDuplicateAuction();

  const { data, isPending, isError, refetch } = useGetAuctionDetail(batchId);
  const batch = data?.data;

  if (isPending) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner className="size-6" />
      </div>
    );
  }

  if (isError || !batch) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Batch tidak ditemukan.</p>
        <Link href="/auctions/list">
          <Button variant="outline">Kembali ke Daftar</Button>
        </Link>
      </div>
    );
  }

  const status = auctionStatusVariant[batch.status];
  const canEdit = ["DRAFT", "OPEN", "SOLD"].includes(batch.status);

  const handleDuplicate = () => {
    duplicateAuction(
      {
        params: { id: batch.id },
        idempotencyKey: `duplicate-${batch.id}-${crypto.randomUUID()}`,
      },
      {
        onSuccess: (response) => {
          toast.success(response.data.message);
          router.push(`/auctions/${response.data.data.id}/edit`);
        },
      },
    );
  };

  return (
    <div className="flex flex-col gap-6 pt-4">
      <div className="flex flex-wrap items-center gap-3">
        <Link href="/auctions/list">
          <Button variant="ghost" size="icon-lg">
            <ArrowLeft className="size-5" />
          </Button>
        </Link>
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <h1 className="truncate text-2xl font-semibold leading-none">
            {batch.nama_id}
          </h1>
          <Badge variant={status.variant} className="capitalize">
            {status.label}
          </Badge>
        </div>
        {canManage && (
          <div className="ml-auto flex flex-wrap items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              className="h-12 text-xs"
              disabled={isDuplicating}
              onClick={handleDuplicate}
            >
              <Copy className="size-3.5" />
              {isDuplicating ? "Menyalin..." : "Salin sebagai Draft"}
            </Button>
            {batch.status !== "DRAFT" && (
              <>
                {batch.winner && (
                  <AuctionStatusControl batch={batch} onDone={refetch} />
                )}
                <AuctionDisplayControl batch={batch} onDone={refetch} />
              </>
            )}
            {canEdit && (
              <Link href={`/auctions/${batchId}/edit`}>
                <Button variant="outline" className="h-12 text-xs">
                  <Pencil className="size-3.5" />
                  Edit Batch
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>

      <Tabs defaultValue="detail">
        <TabsList>
          <TabsTrigger value="detail">Detail Batch</TabsTrigger>
          <TabsTrigger value="bids">Bid</TabsTrigger>
        </TabsList>
        <TabsContent value="detail">
          <DetailTab batch={batch} />
        </TabsContent>
        <TabsContent value="bids">
          <BidTab batch={batch} canManage={canManage} onChanged={refetch} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
