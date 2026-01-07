import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Fragment } from "react";
const skeletonLoading = [
  "Profil Saya",
  "Ganti Password",
  "Informasi Gudang",
  "Bantuan Whatsapp",
  "Informasi Pengambilan",
];

const Loading = () => {
  return (
    <div className="flex flex-col gap-6 w-full max-w-3xl mx-auto">
      <h1 className="text-xl lg:text-2xl font-bold">Pengaturan Umum</h1>
      {skeletonLoading.map((data) => (
        <Fragment key={data}>
          <Separator />
          <div className="grid lg:grid-cols-2 max-w-3xl mx-auto w-full gap-4">
            <h2 className="font-semibold text-lg lg:text-xl tracking-tight">
              {data}
            </h2>
            <Skeleton className="h-52 w-full" />
          </div>
        </Fragment>
      ))}
    </div>
  );
};

export default Loading;
