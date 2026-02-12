import { MainContainer } from "@/components/container/main-container";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Settings } from "lucide-react";
import { Fragment } from "react";
const skeletonLoading = [
  "Profil Saya",
  "Ganti Password",
  "Informasi Gudang",
  "Bantuan Whatsapp",
  "Informasi Pengambilan",
  "Metode Pembayaran",
];

const Loading = () => {
  return (
    <MainContainer breadcrumbs={[{ label: "Pengaturan" }, { label: "Umum" }]}>
      <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto">
        <div className="flex items-center gap-3 w-full max-w-4xl mx-auto pt-4">
          <div className="size-8 bg-yellow-300 dark:bg-yellow-500 rounded-lg flex items-center justify-center text-black">
            <Settings className="size-6 stroke-2" />
          </div>
          <h1 className="text-xl lg:text-2xl font-bold">Pengaturan Umum</h1>
        </div>
        {skeletonLoading.map((data) => (
          <Fragment key={data}>
            <Separator />
            <div className="grid lg:grid-cols-2 max-w-4xl mx-auto w-full gap-4">
              <div className="p-4">
                <h2 className="font-semibold text-lg lg:text-xl tracking-tight flex items-center relative before:content-[''] before:absolute before:-left-3 before:w-1 before:h-5  before:bg-linear-to-b before:from-yellow-400 before:to-yellow-500 before:rounded-full">
                  Profil Saya
                </h2>
              </div>
              <Skeleton className="h-52 w-full" />
            </div>
          </Fragment>
        ))}
      </div>
    </MainContainer>
  );
};

export default Loading;
